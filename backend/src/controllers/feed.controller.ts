import { Request, Response } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { ObjectId, type Filter } from "mongodb";
import { z } from "zod";
import { env } from "../config/env";
import { getDb } from "../db/mongo";
import { HttpError } from "../utils/http";
import { parseObjectId } from "../utils/object-id";

// --- Interfaces ---
export interface UserDoc {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PostDoc {
  _id: ObjectId;
  authorId: ObjectId;
  text: string;
  imageUrl: string | null;
  visibility: "private" | "public";
  createdAt: Date;
  updatedAt: Date;
}

export interface PostLikeDoc {
  _id: ObjectId;
  postId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
}

export interface CommentDoc {
  _id: ObjectId;
  postId: ObjectId;
  userId: ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentLikeDoc {
  _id: ObjectId;
  commentId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
}

export interface ReplyDoc {
  _id: ObjectId;
  postId: ObjectId;
  commentId: ObjectId;
  userId: ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReplyLikeDoc {
  _id: ObjectId;
  replyId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
}

// --- Schemas ---
const createPostSchema = z.object({
  text: z.string().trim().max(5000).optional(),
  visibility: z.enum(["private", "public"]).default("public"),
});

const createCommentSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().datetime().optional(),
});

// --- Multer Configuration ---
const uploadPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadPath),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      cb(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new HttpError(400, "Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});

export function getUploadStaticPath() {
  return uploadPath;
}

// --- Helpers ---
function toPublicUser(user?: UserDoc) {
  if (!user) return null;
  return {
    id: user._id.toHexString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

async function ensurePostAccess(postId: ObjectId, viewerId: ObjectId): Promise<PostDoc> {
  const db = getDb();
  const posts = db.collection<PostDoc>("posts");
  const post = await posts.findOne({ _id: postId });

  if (!post) {
    throw new HttpError(404, "Post not found");
  }

  if (post.visibility === "private" && !post.authorId.equals(viewerId)) {
    throw new HttpError(403, "This post is private");
  }

  return post;
}

async function getUsersMap(ids: ObjectId[]) {
  const uniqueIds = [...new Map(ids.map((id) => [id.toHexString(), id])).values()];
  if (uniqueIds.length === 0) return new Map<string, UserDoc>();

  const db = getDb();
  const users = db.collection<UserDoc>("users");
  const docs = await users.find({ _id: { $in: uniqueIds } }).toArray();
  return new Map(docs.map((u) => [u._id.toHexString(), u]));
}

async function getLikeCounts(
  collectionName: string,
  fieldName: string,
  ids: ObjectId[],
): Promise<Map<string, number>> {
  if (ids.length === 0) return new Map();

  const db = getDb();
  const pipeline = [
    { $match: { [fieldName]: { $in: ids } } },
    { $group: { _id: `$${fieldName}`, count: { $sum: 1 } } },
  ];

  const result = await db.collection(collectionName).aggregate<{ _id: ObjectId; count: number }>(pipeline).toArray();
  return new Map(result.map((x) => [x._id.toHexString(), x.count]));
}

async function getViewerLikeSet(
  collectionName: string,
  fieldName: string,
  ids: ObjectId[],
  viewerId: ObjectId,
): Promise<Set<string>> {
  if (ids.length === 0) return new Set();

  const db = getDb();
  const docs = await db
    .collection(collectionName)
    .find({ userId: viewerId, [fieldName]: { $in: ids } } as Filter<Record<string, unknown>>)
    .toArray();

  return new Set(
    docs
      .map((doc) => doc[fieldName] as ObjectId | undefined)
      .filter((id): id is ObjectId => Boolean(id))
      .map((id) => id.toHexString()),
  );
}

// --- Route Handlers ---

export const createPost = async (req: Request, res: Response) => {
  const authUserId = parseObjectId(req.auth!.sub)!;
  const payload = createPostSchema.parse(req.body);

  const text = payload.text?.trim() ?? "";
  const imageUrl = req.file ? `/${env.UPLOAD_DIR}/${req.file.filename}` : null;

  if (!text && !imageUrl) {
    throw new HttpError(400, "Post must contain text or image");
  }

  const now = new Date();
  const post: PostDoc = {
    _id: new ObjectId(),
    authorId: authUserId,
    text,
    imageUrl,
    visibility: payload.visibility,
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  await db.collection<PostDoc>("posts").insertOne(post);

  res.status(201).json({
    post: {
      id: post._id.toHexString(),
      authorId: post.authorId.toHexString(),
      text: post.text,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    },
  });
};

export const getPosts = async (req: Request, res: Response) => {
  const authUserId = parseObjectId(req.auth!.sub)!;
  const { limit, cursor } = paginationSchema.parse(req.query);

  const db = getDb();
  const postsCol = db.collection<PostDoc>("posts");

  const filter: Filter<PostDoc> = {
    $or: [{ visibility: "public" }, { authorId: authUserId }],
  };

  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const posts = await postsCol.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit + 1).toArray();
  const hasMore = posts.length > limit;
  const visiblePosts = hasMore ? posts.slice(0, limit) : posts;

  const postIds = visiblePosts.map((post) => post._id);
  const comments = await db
    .collection<CommentDoc>("comments")
    .find({ postId: { $in: postIds } })
    .sort({ createdAt: 1 })
    .toArray();

  const commentIds = comments.map((comment) => comment._id);
  const replies = await db
    .collection<ReplyDoc>("replies")
    .find({ commentId: { $in: commentIds } })
    .sort({ createdAt: 1 })
    .toArray();

  const allUserIds: ObjectId[] = [
    ...visiblePosts.map((post) => post.authorId),
    ...comments.map((comment) => comment.userId),
    ...replies.map((reply) => reply.userId),
  ];

  const usersMap = await getUsersMap(allUserIds);

  const [
    postLikeCounts,
    commentLikeCounts,
    replyLikeCounts,
    viewerPostLikes,
    viewerCommentLikes,
    viewerReplyLikes,
    postLikesSamples,
  ] = await Promise.all([
    getLikeCounts("post_likes", "postId", postIds),
    getLikeCounts("comment_likes", "commentId", commentIds),
    getLikeCounts("reply_likes", "replyId", replies.map((x) => x._id)),
    getViewerLikeSet("post_likes", "postId", postIds, authUserId),
    getViewerLikeSet("comment_likes", "commentId", commentIds, authUserId),
    getViewerLikeSet("reply_likes", "replyId", replies.map((x) => x._id), authUserId),
    db.collection<PostLikeDoc>("post_likes")
      .aggregate([
        { $match: { postId: { $in: postIds } } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$postId", likes: { $push: "$$ROOT" } } },
        { $project: { likes: { $slice: ["$likes", 5] } } },
      ])
      .toArray(),
  ]);

  const postLikesSampleMap = new Map<string, ObjectId[]>(
    postLikesSamples.map((x) => [x._id.toHexString(), x.likes.map((l: any) => l.userId)]),
  );

  const sampleUserIds = [...new Set(postLikesSamples.flatMap((x) => x.likes.map((l: any) => l.userId)))];
  const sampleUsersMap = sampleUserIds.length > 0 ? await getUsersMap(sampleUserIds) : new Map<string, UserDoc>();

  for (const [id, user] of sampleUsersMap) {
    usersMap.set(id, user);
  }

  const repliesByCommentId = new Map<string, ReplyDoc[]>();
  for (const reply of replies) {
    const key = reply.commentId.toHexString();
    const items = repliesByCommentId.get(key) ?? [];
    items.push(reply);
    repliesByCommentId.set(key, items);
  }

  const commentsByPostId = new Map<string, CommentDoc[]>();
  for (const comment of comments) {
    const key = comment.postId.toHexString();
    const items = commentsByPostId.get(key) ?? [];
    items.push(comment);
    commentsByPostId.set(key, items);
  }

  const responsePosts = visiblePosts.map((post) => {
    const postComments = commentsByPostId.get(post._id.toHexString()) ?? [];
    const likedByUsers =
      postLikesSampleMap
        .get(post._id.toHexString())
        ?.map((userId) => toPublicUser(usersMap.get(userId.toHexString())))
        .filter(Boolean) || [];

    return {
      id: post._id.toHexString(),
      author: toPublicUser(usersMap.get(post.authorId.toHexString())),
      text: post.text,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likeCount: postLikeCounts.get(post._id.toHexString()) ?? 0,
      viewerHasLiked: viewerPostLikes.has(post._id.toHexString()),
      likedBy: likedByUsers,
      comments: postComments.map((comment) => {
        const itemReplies = repliesByCommentId.get(comment._id.toHexString()) ?? [];
        return {
          id: comment._id.toHexString(),
          postId: comment.postId.toHexString(),
          author: toPublicUser(usersMap.get(comment.userId.toHexString())),
          text: comment.text,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          likeCount: commentLikeCounts.get(comment._id.toHexString()) ?? 0,
          viewerHasLiked: viewerCommentLikes.has(comment._id.toHexString()),
          replies: itemReplies.map((reply) => ({
            id: reply._id.toHexString(),
            commentId: reply.commentId.toHexString(),
            postId: reply.postId.toHexString(),
            author: toPublicUser(usersMap.get(reply.userId.toHexString())),
            text: reply.text,
            createdAt: reply.createdAt,
            updatedAt: reply.updatedAt,
            likeCount: replyLikeCounts.get(reply._id.toHexString()) ?? 0,
            viewerHasLiked: viewerReplyLikes.has(reply._id.toHexString()),
          })),
        };
      }),
    };
  });

  res.status(200).json({
    posts: responsePosts,
    nextCursor: hasMore ? visiblePosts[visiblePosts.length - 1]?.createdAt.toISOString() : null,
  });
};

export const togglePostLike = async (req: Request, res: Response) => {
  const authUserId = parseObjectId(req.auth!.sub)!;
  const postId = parseObjectId(req.params.postId);

  if (!postId) throw new HttpError(400, "Invalid post id");
  await ensurePostAccess(postId, authUserId);

  const db = getDb();
  const likesCol = db.collection<PostLikeDoc>("post_likes");

  const existing = await likesCol.findOne({ postId, userId: authUserId });
  if (existing) {
    await likesCol.deleteOne({ _id: existing._id });
  } else {
    await likesCol.insertOne({ _id: new ObjectId(), postId, userId: authUserId, createdAt: new Date() });
  }

  const likeCount = await likesCol.countDocuments({ postId });
  const latestLikes = await likesCol.find({ postId }).sort({ createdAt: -1 }).limit(5).toArray();
  const usersMap = await getUsersMap(latestLikes.map((x) => x.userId));
  const likedBy = latestLikes.map((l) => toPublicUser(usersMap.get(l.userId.toHexString())));

  res.status(200).json({ liked: !existing, likeCount, likedBy });
};

export const getPostLikes = async (req: Request, res: Response) => {
  const authUserId = parseObjectId(req.auth!.sub)!;
  const postId = parseObjectId(req.params.postId);

  if (!postId) throw new HttpError(400, "Invalid post id");
  await ensurePostAccess(postId, authUserId);

  const { limit, cursor } = paginationSchema.parse(req.query);
  const db = getDb();
  const likesCol = db.collection<PostLikeDoc>("post_likes");

  const filter: Filter<PostLikeDoc> = { postId };
  if (cursor) filter.createdAt = { $lt: new Date(cursor) };

  const likes = await likesCol.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit + 1).toArray();
  const hasMore = likes.length > limit;
  const visibleLikes = hasMore ? likes.slice(0, limit) : likes;

  const usersMap = await getUsersMap(visibleLikes.map((x) => x.userId));

  res.status(200).json({
    users: visibleLikes
      .map((like) => usersMap.get(like.userId.toHexString()))
      .filter(Boolean)
      .map((u) => toPublicUser(u as UserDoc)),
    nextCursor: hasMore ? visibleLikes[visibleLikes.length - 1]?.createdAt.toISOString() : null,
  });
};

export const addComment = async (req: Request, res: Response) => {
  const authUserId = parseObjectId(req.auth!.sub)!;
  const postId = parseObjectId(req.params.postId);

  if (!postId) throw new HttpError(400, "Invalid post id");
  await ensurePostAccess(postId, authUserId);

  const payload = createCommentSchema.parse(req.body);
  const now = new Date();

  const comment: CommentDoc = {
    _id: new ObjectId(),
    postId,
    userId: authUserId,
    text: payload.text,
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  await db.collection<CommentDoc>("comments").insertOne(comment);

  res.status(201).json({
    comment: {
      id: comment._id.toHexString(),
      postId: comment.postId.toHexString(),
      userId: comment.userId.toHexString(),
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    },
  });
};

export const addReply = async (req: Request, res: Response) => {
  const authUserId = parseObjectId(req.auth!.sub)!;
  const commentId = parseObjectId(req.params.commentId);

  if (!commentId) throw new HttpError(400, "Invalid comment id");
  const payload = createCommentSchema.parse(req.body);
  const db = getDb();

  const comment = await db.collection<CommentDoc>("comments").findOne({ _id: commentId });
  if (!comment) throw new HttpError(404, "Comment not found");

  await ensurePostAccess(comment.postId, authUserId);

  const now = new Date();
  const reply: ReplyDoc = {
    _id: new ObjectId(),
    postId: comment.postId,
    commentId,
    userId: authUserId,
    text: payload.text,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<ReplyDoc>("replies").insertOne(reply);

  res.status(201).json({
    reply: {
      id: reply._id.toHexString(),
      postId: reply.postId.toHexString(),
      commentId: reply.commentId.toHexString(),
      userId: reply.userId.toHexString(),
      text: reply.text,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
    },
  });
};

export const toggleCommentLike = async (req: Request, res: Response) => {
  const authUserId = parseObjectId(req.auth!.sub)!;
  const commentId = parseObjectId(req.params.commentId);
  if (!commentId) throw new HttpError(400, "Invalid comment id");

  const db = getDb();
  const commentsCol = db.collection<CommentDoc>("comments");
  const likesCol = db.collection<CommentLikeDoc>("comment_likes");

  const comment = await commentsCol.findOne({ _id: commentId });
  if (!comment) throw new HttpError(404, "Comment not found");

  await ensurePostAccess(comment.postId, authUserId);

  const existing = await likesCol.findOne({ commentId, userId: authUserId });
  if (existing) {
    await likesCol.deleteOne({ _id: existing._id });
  } else {
    await likesCol.insertOne({ _id: new ObjectId(), commentId, userId: authUserId, createdAt: new Date() });
  }

  const likeCount = await likesCol.countDocuments({ commentId });
  res.status(200).json({ liked: !existing, likeCount });
};

export const getCommentLikes = async (req: Request, res: Response) => {
  const authUserId = parseObjectId(req.auth!.sub)!;
  const commentId = parseObjectId(req.params.commentId);
  if (!commentId) throw new HttpError(400, "Invalid comment id");

  const db = getDb();
  const comment = await db.collection<CommentDoc>("comments").findOne({ _id: commentId });
  if (!comment) throw new HttpError(404, "Comment not found");

  await ensurePostAccess(comment.postId, authUserId);

  const likes = await db.collection<CommentLikeDoc>("comment_likes").find({ commentId }).sort({ createdAt: -1 }).toArray();
  const usersMap = await getUsersMap(likes.map((x) => x.userId));

  res.status(200).json({
    users: likes
      .map((like) => usersMap.get(like.userId.toHexString()))
      .filter(Boolean)
      .map((u) => toPublicUser(u as UserDoc)),
  });
};

export const toggleReplyLike = async (req: Request, res: Response) => {
  const authUserId = parseObjectId(req.auth!.sub)!;
  const replyId = parseObjectId(req.params.replyId);
  if (!replyId) throw new HttpError(400, "Invalid reply id");

  const db = getDb();
  const reply = await db.collection<ReplyDoc>("replies").findOne({ _id: replyId });
  if (!reply) throw new HttpError(404, "Reply not found");

  await ensurePostAccess(reply.postId, authUserId);

  const likesCol = db.collection<ReplyLikeDoc>("reply_likes");
  const existing = await likesCol.findOne({ replyId, userId: authUserId });

  if (existing) {
    await likesCol.deleteOne({ _id: existing._id });
  } else {
    await likesCol.insertOne({ _id: new ObjectId(), replyId, userId: authUserId, createdAt: new Date() });
  }

  const likeCount = await likesCol.countDocuments({ replyId });
  res.status(200).json({ liked: !existing, likeCount });
};

export const getReplyLikes = async (req: Request, res: Response) => {
  const authUserId = parseObjectId(req.auth!.sub)!;
  const replyId = parseObjectId(req.params.replyId);
  if (!replyId) throw new HttpError(400, "Invalid reply id");

  const db = getDb();
  const reply = await db.collection<ReplyDoc>("replies").findOne({ _id: replyId });
  if (!reply) throw new HttpError(404, "Reply not found");

  await ensurePostAccess(reply.postId, authUserId);

  const likes = await db.collection<ReplyLikeDoc>("reply_likes").find({ replyId }).sort({ createdAt: -1 }).toArray();
  const usersMap = await getUsersMap(likes.map((x) => x.userId));

  res.status(200).json({
    users: likes
      .map((like) => usersMap.get(like.userId.toHexString()))
      .filter(Boolean)
      .map((u) => toPublicUser(u as UserDoc)),
  });
};

export async function ensureFeedIndexes() {
  const db = getDb();

  await Promise.all([
    db.collection<UserDoc>("users").createIndex({ emailLower: 1 }, { unique: true }),
    db.collection<PostDoc>("posts").createIndex({ createdAt: -1 }),
    db.collection<PostDoc>("posts").createIndex({ visibility: 1, createdAt: -1 }),
    db.collection<PostDoc>("posts").createIndex({ authorId: 1, createdAt: -1 }),
    db.collection<PostLikeDoc>("post_likes").createIndex({ postId: 1, userId: 1 }, { unique: true }),
    db.collection<PostLikeDoc>("post_likes").createIndex({ postId: 1, createdAt: -1 }),
    db.collection<CommentDoc>("comments").createIndex({ postId: 1, createdAt: 1 }),
    db.collection<CommentLikeDoc>("comment_likes").createIndex({ commentId: 1, userId: 1 }, { unique: true }),
    db.collection<CommentLikeDoc>("comment_likes").createIndex({ commentId: 1, createdAt: -1 }),
    db.collection<ReplyDoc>("replies").createIndex({ commentId: 1, createdAt: 1 }),
    db.collection<ReplyLikeDoc>("reply_likes").createIndex({ replyId: 1, userId: 1 }, { unique: true }),
    db.collection<ReplyLikeDoc>("reply_likes").createIndex({ replyId: 1, createdAt: -1 }),
  ]);
}
