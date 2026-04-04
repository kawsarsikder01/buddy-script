import { useState } from 'react';
import Avatar from './Avatar';
import CommentForm from './CommentForm';
import ReplyItem from './ReplyItem';
import type { Comment, Author } from './types';
import { timeAgo } from './types';

interface CommentItemProps {
  comment: Comment;
  currentUser?: Author | null;
  onToggleCommentLike: (commentId: string) => void;
  onToggleReplyLike: (replyId: string) => void;
  onAddReply: (commentId: string, text: string) => Promise<void>;
}

export default function CommentItem({
  comment,
  currentUser,
  onToggleCommentLike,
  onToggleReplyLike,
  onAddReply,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const authorName = comment.author
    ? `${comment.author.firstName} ${comment.author.lastName}`
    : 'Unknown User';

  const visibleReplies = showAllReplies
    ? comment.replies
    : comment.replies.slice(0, 2);

  const hiddenRepliesCount = comment.replies.length - 2;

  return (
    <div className="_comment_main" style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
      {/* Avatar */}
      <div className="_comment_image" style={{ flexShrink: 0 }}>
        <Avatar author={comment.author} size="md" />
      </div>

      {/* Content */}
      <div className="_comment_area" style={{ flex: 1, minWidth: 0 }}>
        {/* Comment bubble */}
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          <div style={{
            background: '#f0f2f5',
            borderRadius: 18,
            padding: '8px 12px',
          }}>
            <h4 style={{
              fontSize: 13, fontWeight: 600, margin: 0,
              color: '#050505', lineHeight: 1.3,
            }}>
              {authorName}
            </h4>
            <p style={{
              fontSize: 14, margin: '2px 0 0', color: '#050505',
              lineHeight: 1.4, wordBreak: 'break-word',
            }}>
              {comment.text}
            </p>
          </div>

          {/* Like count badge */}
          {comment.likeCount > 0 && (
            <div
              onClick={() => onToggleCommentLike(comment.id)}
              style={{
                position: 'absolute',
                bottom: -6,
                right: -4,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: '#fff',
                borderRadius: 10,
                padding: '1px 5px 1px 2px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                zIndex: 1,
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, borderRadius: '50%',
                background: 'linear-gradient(180deg, #69ABFD 0%, #1877F2 100%)',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="none">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#65676b' }}>
                {comment.likeCount}
              </span>
            </div>
          )}
        </div>

        {/* Action row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          paddingLeft: 12, marginTop: comment.likeCount > 0 ? 8 : 4,
          fontSize: 12, fontWeight: 700,
        }}>
          <span
            onClick={() => onToggleCommentLike(comment.id)}
            style={{
              cursor: 'pointer',
              color: comment.viewerHasLiked ? '#1877F2' : '#65676b',
              userSelect: 'none',
              transition: 'color 0.2s',
            }}
          >
            {comment.viewerHasLiked ? 'Liked' : 'Like'}
          </span>
          <span
            onClick={() => setShowReplyForm(!showReplyForm)}
            style={{ cursor: 'pointer', color: '#65676b', userSelect: 'none' }}
          >
            Reply
          </span>
          <span style={{ color: '#8e8e8e', fontWeight: 400 }}>
            {timeAgo(comment.createdAt)}
          </span>
        </div>

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {!showAllReplies && hiddenRepliesCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllReplies(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginBottom: 4, fontSize: 13, fontWeight: 600,
                  color: '#65676b', cursor: 'pointer', background: 'none',
                  border: 'none', padding: '4px 0',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#65676b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                View {hiddenRepliesCount} more {hiddenRepliesCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
            {visibleReplies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onToggleLike={onToggleReplyLike}
              />
            ))}
          </div>
        )}

        {/* Reply form */}
        {showReplyForm && (
          <div style={{ marginTop: 6 }}>
            <CommentForm
              currentUser={currentUser}
              placeholder="Write a reply..."
              id={`reply-form-${comment.id}`}
              onSubmit={async (text) => {
                await onAddReply(comment.id, text);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
