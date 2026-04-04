import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { List } from 'react-window';
import Avatar from './Avatar';
import type { Author } from './types';

interface LikesModalProps {
  postId: string;
  onClose: () => void;
}

const PAGE_SIZE = 20;
const ITEM_HEIGHT = 60;

export default function LikesModal({ postId, onClose }: LikesModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent scroll on body
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['post-likes', postId],
    queryFn: async ({ pageParam = null }) => {
      const res = await axios.get(`/api/post/${postId}/likes`, {
        params: {
          cursor: pageParam,
          limit: PAGE_SIZE,
        },
      });
      return res.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const users = data?.pages.flatMap((page) => page.users) ?? [];

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const Row = ({ index, style }: any) => {
    const user = users[index];
    
    // Trigger fetchNextPage if near end
    if (index === users.length - 1 && hasNextPage && !isFetchingNextPage) {
      setTimeout(() => fetchNextPage(), 0);
    }

    if (!user) return null;

    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #f0f0f0' }}>
        <Avatar author={user} size="md" />
        <div style={{ marginLeft: 12 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{user.firstName} {user.lastName}</h4>
          <p style={{ margin: 0, fontSize: 12, color: '#999' }}>{user.email}</p>
        </div>
      </div>
    );
  };

  const modalContent = (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          width: '90%', maxWidth: 500,
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: '80vh'
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Post Likes</h3>
          <button 
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}
          >
            &times;
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 400 }}>
          {status === 'pending' ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading users...</div>
          ) : status === 'error' ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>Error loading likes.</div>
          ) : users.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>No likes yet.</div>
          ) : (
            <List
              style={{ height: 400, width: '100%' }}
              rowCount={users.length}
              rowHeight={ITEM_HEIGHT}
              rowComponent={Row}
              rowProps={{}}
            />
          )}
          {isFetchingNextPage && <div style={{ textAlign: 'center', padding: 8, fontSize: 12, color: '#999' }}>Fetching more...</div>}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
