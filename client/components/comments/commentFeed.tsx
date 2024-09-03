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
    const interval = setInterval(() => {
      setCommentsIndex((prevCommentsIndex) => {
        const nextIndex = prevCommentsIndex + 1;
        // Check if the next index is equal to the length of the comments array
        if (nextIndex > comments.length) {
          clearInterval(interval);
          onComplete();
        }
        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   // Set a timeout based on the current comment's displayTime
  //   const timeout = setTimeout(() => {
  //     setCommentsIndex((prevCommentsIndex) => {
  //       const nextIndex = prevCommentsIndex + 1;
  //       if (nextIndex > comments.length) {
  //         onComplete();
  //       }
  //       return nextIndex;
  //     });
  //   }, comments[commentsIndex]?.displayTime);
  //   return () => clearTimeout(timeout); // Cleanup timeout on unmount
  // }, [comments, commentsIndex, onComplete]);

  useEffect(() => {
    setDisplayedComments(() => {
      const updatedComments = comments.slice(commentsIndex, commentsIndex + 1);
      return updatedComments;
    });
  }, [commentsIndex]);

  return (
    <div className="fixed bottom-0 right-0 w-full p-4">
      <div className="relative h-160">
        <motion.div
          className="flex flex-col space-y-400"
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
