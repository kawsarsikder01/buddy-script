import { useState } from 'react';
import Avatar from './Avatar';
import PostActions from './PostActions';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import type { Post, Author } from './types';
import { timeAgo } from './types';
import axios from 'axios';

interface PostCardProps {
  post: Post;
  currentUser?: Author | null;
  onPostUpdated: (updatedPost: Post) => void;
}

export default function PostCard({ post, currentUser, onPostUpdated }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const authorName = post.author
    ? `${post.author.firstName} ${post.author.lastName}`
    : 'Unknown User';

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  // ---------- Like handlers ----------
  const handleTogglePostLike = async () => {
    try {
      const res = await axios.post(`/api/post/${post.id}/likes/toggle`);
      onPostUpdated({
        ...post,
        likeCount: res.data.likeCount,
        viewerHasLiked: res.data.liked,
        likedBy: res.data.likedBy,
      });
    } catch (err) {
      console.error('Failed to toggle post like', err);
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    try {
      const res = await axios.post(`/api/post/comments/${commentId}/likes/toggle`);
      onPostUpdated({
        ...post,
        comments: post.comments.map((c) =>
          c.id === commentId
            ? { ...c, likeCount: res.data.likeCount, viewerHasLiked: res.data.liked }
            : c
        ),
      });
    } catch (err) {
      console.error('Failed to toggle comment like', err);
    }
  };

  const handleToggleReplyLike = async (replyId: string) => {
    try {
      const res = await axios.post(`/api/post/replies/${replyId}/likes/toggle`);
      onPostUpdated({
        ...post,
        comments: post.comments.map((c) => ({
          ...c,
          replies: c.replies.map((r) =>
            r.id === replyId
              ? { ...r, likeCount: res.data.likeCount, viewerHasLiked: res.data.liked }
              : r
          ),
        })),
      });
    } catch (err) {
      console.error('Failed to toggle reply like', err);
    }
  };

  // ---------- Add comment ----------
  const handleAddComment = async (text: string) => {
    try {
      const res = await axios.post(`/api/post/${post.id}/comments`, { text });
      const newComment = {
        ...res.data.comment,
        author: currentUser,
        likeCount: 0,
        viewerHasLiked: false,
        replies: [],
      };
      onPostUpdated({
        ...post,
        comments: [...post.comments, newComment],
      });
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  // ---------- Add reply ----------
  const handleAddReply = async (commentId: string, text: string) => {
    try {
      const res = await axios.post(`/api/post/comments/${commentId}/replies`, { text });
      const newReply = {
        ...res.data.reply,
        author: currentUser,
        likeCount: 0,
        viewerHasLiked: false,
      };
      onPostUpdated({
        ...post,
        comments: post.comments.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...c.replies, newReply] }
            : c
        ),
      });
    } catch (err) {
      console.error('Failed to add reply', err);
    }
  };

  const visibleComments = showAllComments
    ? post.comments
    : post.comments.slice(-2);

  const hiddenCount = post.comments.length - 2;

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        {/* Post header */}
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <Avatar author={post.author} size="lg" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{authorName}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeAgo(post.createdAt)} .
                <span style={{ marginLeft: 4, textTransform: 'capitalize' }}>{post.visibility}</span>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <button
                type="button"
                className="_feed_timeline_post_dropdown_link"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
            </div>
            {dropdownOpen && (
              <div className="_feed_timeline_dropdown" style={{ display: 'block' }}>
                <ul className="_feed_timeline_dropdown_list">
                  <li className="_feed_timeline_dropdown_item">
                    <button className="_feed_timeline_dropdown_link" onClick={() => setDropdownOpen(false)}>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                          <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z" />
                        </svg>
                      </span>
                      Save Post
                    </button>
                  </li>
                  <li className="_feed_timeline_dropdown_item">
                    <button className="_feed_timeline_dropdown_link" onClick={() => setDropdownOpen(false)}>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                          <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 2.25H3.75a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V3.75a1.5 1.5 0 00-1.5-1.5zM6.75 6.75l4.5 4.5M11.25 6.75l-4.5 4.5" />
                        </svg>
                      </span>
                      Hide
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Post text */}
        {post.text && (
          <h4 className="_feed_inner_timeline_post_title">{post.text}</h4>
        )}

        {/* Post image */}
        {post.imageUrl && (
          <div className="_feed_inner_timeline_image">
            <img
              src={`${backendUrl}${post.imageUrl}`}
              alt="Post image"
              className="_time_img"
            />
          </div>
        )}
      </div>

      {/* Actions bar */}
      <PostActions
        postId={post.id}
        likeCount={post.likeCount}
        likedBy={post.likedBy}
        commentCount={post.comments.length}
        viewerHasLiked={post.viewerHasLiked}
        onToggleLike={handleTogglePostLike}
        onToggleComments={() => setShowComments(!showComments)}
      />

      {/* Comments section */}
      {showComments && (
        <div className="_feed_inner_timeline_cooment_area">
          {/* Comment input */}
          <CommentForm
            currentUser={currentUser}
            placeholder="Write a comment"
            id={`comment-form-${post.id}`}
            onSubmit={handleAddComment}
          />

          {/* Comments list */}
          <div className="_timline_comment_main">
            {!showAllComments && hiddenCount > 0 && (
              <div className="_previous_comment">
                <button
                  type="button"
                  className="_previous_comment_txt"
                  onClick={() => setShowAllComments(true)}
                >
                  View {hiddenCount} previous comment{hiddenCount !== 1 ? 's' : ''}
                </button>
              </div>
            )}

            {visibleComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onToggleCommentLike={handleToggleCommentLike}
                onToggleReplyLike={handleToggleReplyLike}
                onAddReply={handleAddReply}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
