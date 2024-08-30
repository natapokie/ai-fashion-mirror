// src/components/CommentFeed.tsx
import React, { useState, useEffect } from 'react';
import Comment from '@/components/comments/comment';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentType } from '../../../shared/types';

interface CommentFeedProps {
  comments: CommentType[];
  onComplete: () => void;
}

const CommentFeed: React.FC<CommentFeedProps> = ({ comments, onComplete }) => {
  const [displayedComments, setDisplayedComments] = useState<CommentType[]>([]);
  const [commentsIndex, setCommentsIndex] = useState(0);

  useEffect(() => {
    // TODO: remove setTimeout and call this in the right place after all comments have been previewed and faded off the screen
    // idea: check the comments index
    setTimeout(() => {
      console.log('Comments animations complete');
      onComplete();
    }, 15_000);

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
