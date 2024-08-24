// src/components/CommentFeed.tsx
import React, { useState, useEffect, use } from 'react';
import Comment from '@/components/comments/comment';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentType } from '../../../shared/types';

interface CommentFeedProps {
  comments: CommentType[];
}

const CommentFeed: React.FC<CommentFeedProps> = ({ comments }) => {
  const [displayedComments, setDisplayedComments] = useState<CommentType[]>([]);
  const [commentsIndex, setCommentsIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCommentsIndex((prevCommentsIndex) => {
        return prevCommentsIndex + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplayedComments(() => {
      const updatedComments = comments.slice(commentsIndex, commentsIndex + 1);
      console.log('eri' + commentsIndex, updatedComments);
      return updatedComments;
    });
  }, [commentsIndex]);

  return (
    <div className="fixed bottom-0 right-0 w-full p-4">
      <div className="relative h-80">
        <motion.div
          className="flex flex-col space-y-2"
          style={{ position: 'absolute', bottom: 0, width: '100%' }}
        >
          <AnimatePresence>
            {displayedComments.map((comment) => (
              <Comment key={'comment' + comment.user} comment={comment} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CommentFeed;
