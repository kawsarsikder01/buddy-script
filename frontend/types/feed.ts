export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Reply {
  id: string;
  commentId: string;
  postId: string;
  author: PublicUser | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewerHasLiked: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: PublicUser | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewerHasLiked: boolean;
  replies: Reply[];
}

export interface Post {
  id: string;
  author: PublicUser | null;
  text: string;
  imageUrl: string | null;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewerHasLiked: boolean;
  comments: Comment[];
}

export interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
}
