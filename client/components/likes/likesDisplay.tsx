import React from 'react';

interface LikesDisplayProps {
  animatedLikes: number;
  isAnimating: boolean;
}

export const LikesDisplay: React.FC<LikesDisplayProps> = ({ animatedLikes, isAnimating }) => {
  return (
    <div className="w-full h-16 flex items-center justify-center">
      <div className="flex items-center">
        <span className={`text-4xl font-bold ${isAnimating ? 'animate-pulse' : ''}`}>❤️</span>
        <span className="text-4xl font-bold ml-2 w-20 text-left">{animatedLikes}</span>
      </div>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
        .animate-pulse {
          animation: pulse 0.3s infinite;
        }
      `}</style>
    </div>
  );
};
