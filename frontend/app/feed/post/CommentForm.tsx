import { useState } from 'react';
import Avatar from './Avatar';
import type { Author } from './types';

interface CommentFormProps {
  currentUser?: Author | null;
  placeholder?: string;
  onSubmit: (text: string) => void | Promise<void>;
  id?: string;
}

export default function CommentForm({
  currentUser = null,
  placeholder = 'Write a comment',
  onSubmit,
  id,
}: CommentFormProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="_feed_inner_comment_box">
      <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
        <div className="_feed_inner_comment_box_content">
          <div className="_feed_inner_comment_box_content_image">
            <Avatar author={currentUser} size="sm" />
          </div>
          <div className="_feed_inner_comment_box_content_txt">
            <textarea
              className="form-control _comment_textarea"
              placeholder={placeholder}
              id={id}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitting}
            />
          </div>
        </div>
        <div className="_feed_inner_comment_box_icon">
          <button type="submit" className="_feed_inner_comment_box_icon_btn" disabled={submitting || !text.trim()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 14 13">
              <path fill={text.trim() ? '#1890FF' : '#000'} fillOpacity={text.trim() ? '1' : '.46'} fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
