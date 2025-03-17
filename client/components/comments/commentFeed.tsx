// src/components/CommentFeed.tsx
import React, { useState, useEffect } from 'react';
import Comment from '@/components/comments/comment';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentType } from '@/utils/types';

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
    <div className="fixed top-[200px] w-full h-full p-4">
      <div className="relative h-full">
        <motion.div className="absolute top-0 w-full flex flex-col my-20">
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
