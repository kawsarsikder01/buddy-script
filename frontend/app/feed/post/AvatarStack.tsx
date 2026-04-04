import React from 'react';
import Avatar from './Avatar';
import type { Author } from './types';

interface AvatarStackProps {
  users: Author[];
  totalCount: number;
  onClick?: () => void;
}

export default function AvatarStack({ users, totalCount, onClick }: AvatarStackProps) {
  if (totalCount === 0) return null;

  const displayUsers = users.slice(0, 5);
  const remainingCount = totalCount - displayUsers.length;

  return (
    <div 
      className="avatar-stack" 
      onClick={onClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        marginLeft: 4 // Give some space for the first overlap
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {displayUsers.map((user, index) => (
          <div
            key={user.id}
            style={{
              marginLeft: index === 0 ? 0 : -10,
              border: '2px solid white',
              borderRadius: '50%',
              zIndex: index,
              backgroundColor: 'white',
              display: 'flex',
              flexShrink: 0
            }}
          >
            <Avatar author={user} size="sm" />
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#1890FF',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              border: '2px solid white',
              marginLeft: -10,
              zIndex: displayUsers.length,
              flexShrink: 0
            }}
          >
            {remainingCount > 9 ? '9+' : `${remainingCount}+`}
          </div>
        )}
      </div>
    </div>
  );
}
