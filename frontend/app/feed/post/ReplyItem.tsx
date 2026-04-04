import Avatar from './Avatar';
import type { Reply } from './types';
import { timeAgo } from './types';

interface ReplyItemProps {
  reply: Reply;
  onToggleLike: (replyId: string) => void;
}

export default function ReplyItem({ reply, onToggleLike }: ReplyItemProps) {
  const authorName = reply.author
    ? `${reply.author.firstName} ${reply.author.lastName}`
    : 'Unknown User';

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      {/* Avatar */}
      <div style={{ flexShrink: 0 }}>
        <Avatar author={reply.author} size="sm" />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Reply bubble */}
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          <div style={{
            background: '#f0f2f5',
            borderRadius: 18,
            padding: '6px 12px',
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
              {reply.text}
            </p>
          </div>

          {/* Like count badge */}
          {reply.likeCount > 0 && (
            <div
              onClick={() => onToggleLike(reply.id)}
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
                width: 16, height: 16, borderRadius: '50%',
                background: 'linear-gradient(180deg, #69ABFD 0%, #1877F2 100%)',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="#fff" stroke="none">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#65676b' }}>
                {reply.likeCount}
              </span>
            </div>
          )}
        </div>

        {/* Action row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          paddingLeft: 12, marginTop: reply.likeCount > 0 ? 8 : 4,
          fontSize: 12, fontWeight: 700,
        }}>
          <span
            onClick={() => onToggleLike(reply.id)}
            style={{
              cursor: 'pointer',
              color: reply.viewerHasLiked ? '#1877F2' : '#65676b',
              userSelect: 'none',
              transition: 'color 0.2s',
            }}
          >
            {reply.viewerHasLiked ? 'Liked' : 'Like'}
          </span>
          <span style={{ color: '#8e8e8e', fontWeight: 400 }}>
            {timeAgo(reply.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
