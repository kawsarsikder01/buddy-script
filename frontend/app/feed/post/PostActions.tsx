import { useState } from "react";
import AvatarStack from "./AvatarStack";
import LikesModal from "./LikesModal";
import type { Author } from "./types";

interface PostActionsProps {
  postId: string;
  likeCount: number;
  likedBy: Author[];
  commentCount: number;
  viewerHasLiked: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
}

export default function PostActions({
  postId,
  likeCount,
  likedBy,
  commentCount,
  viewerHasLiked,
  onToggleLike,
  onToggleComments,
}: PostActionsProps) {
  const [showLikesModal, setShowLikesModal] = useState(false);

  return (
    <>
      {/* Reaction counts */}
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {likeCount > 0 && (
            <AvatarStack users={likedBy} totalCount={likeCount} onClick={() => setShowLikesModal(true)} />
          )}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          {commentCount > 0 && (
            <p
              className="_feed_inner_timeline_total_reacts_para1"
              style={{ cursor: 'pointer' }}
              onClick={onToggleComments}
            >
              <span>{commentCount}</span> Comment{commentCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {showLikesModal && <LikesModal postId={postId} onClose={() => setShowLikesModal(false)} />}

      {/* Action buttons */}
      <div className="_feed_inner_timeline_reaction">
        <button
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${viewerHasLiked ? '_feed_reaction_active' : ''}`}
          onClick={onToggleLike}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24"
                fill={viewerHasLiked ? '#1890FF' : 'none'}
                stroke={viewerHasLiked ? '#1890FF' : 'currentColor'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              {viewerHasLiked ? 'Liked' : 'Like'}
            </span>
          </span>
        </button>
        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={onToggleComments}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
              </svg>
              Comment
            </span>
          </span>
        </button>
        <button className="_feed_inner_timeline_reaction_share _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
              </svg>
              Share
            </span>
          </span>
        </button>
      </div>
    </>
  );
}
