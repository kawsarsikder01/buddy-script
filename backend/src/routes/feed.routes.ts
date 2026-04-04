import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import * as FeedController from "../controllers/feed.controller";

export const feedRouter = Router();
feedRouter.use(requireAuth);

feedRouter.post("/posts", FeedController.upload.single("image"), FeedController.createPost);
feedRouter.get("/posts", FeedController.getPosts);

feedRouter.post("/posts/:postId/likes/toggle", FeedController.togglePostLike);
feedRouter.get("/posts/:postId/likes", FeedController.getPostLikes);

feedRouter.post("/posts/:postId/comments", FeedController.addComment);
feedRouter.post("/comments/:commentId/replies", FeedController.addReply);

feedRouter.post("/comments/:commentId/likes/toggle", FeedController.toggleCommentLike);
feedRouter.get("/comments/:commentId/likes", FeedController.getCommentLikes);

feedRouter.post("/replies/:replyId/likes/toggle", FeedController.toggleReplyLike);
feedRouter.get("/replies/:replyId/likes", FeedController.getReplyLikes);
