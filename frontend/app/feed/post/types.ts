export interface Author {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Reply {
  id: string;
  commentId: string;
  postId: string;
  author: Author | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewerHasLiked: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: Author | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewerHasLiked: boolean;
  replies: Reply[];
}

export interface Post {
  id: string;
  author: Author | null;
  text: string;
  imageUrl: string | null;
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewerHasLiked: boolean;
  likedBy: Author[];
  comments: Comment[];
}

/** Converts a date string to a human-readable "time ago" format */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  if (diffWeek < 5) return `${diffWeek}w`;
  return `${diffMonth}mo`;
}

/** Gets the avatar initial from an Author */
export function getInitial(author: Author | null): string {
  if (!author) return '?';
  return (author.firstName?.[0] ?? '?').toUpperCase();
}

/** Deterministic color palette for avatar backgrounds */
const AVATAR_COLORS = [
  '#1890FF', '#13C2C2', '#52C41A', '#FA8C16',
  '#F5222D', '#722ED1', '#EB2F96', '#2F54EB',
  '#FAAD14', '#A0D911',
];

export function getAvatarColor(author: Author | null): string {
  if (!author) return AVATAR_COLORS[0];
  const code = author.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}
