import { Author, getInitial, getAvatarColor } from './types';

interface AvatarProps {
  author: Author | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ author, size = 'md', className = '' }: AvatarProps) {
  const initial = getInitial(author);
  const bgColor = getAvatarColor(author);

  const sizeMap = {
    sm: { width: 28, height: 28, fontSize: 12 },
    md: { width: 36, height: 36, fontSize: 14 },
    lg: { width: 44, height: 44, fontSize: 18 },
  };

  const dims = sizeMap[size];

  return (
    <div
      className={`_user_avatar ${className}`}
      style={{
        width: dims.width,
        height: dims.height,
        borderRadius: '50%',
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: dims.fontSize,
        lineHeight: 1,
        flexShrink: 0,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
      title={author ? `${author.firstName} ${author.lastName}` : 'Unknown'}
    >
      {initial}
    </div>
  );
}
