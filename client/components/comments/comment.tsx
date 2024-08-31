// src/components/Comment.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { CommentType } from '../../../shared/types';

interface CommentProps {
  comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <motion.div
      className="bg-slate-950/70 text-white p-3 rounded-t-2xl rounded-r-2xl shadow-md mb-2 absolute bottom-0"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: -50, transition: { duration: 4 } }}
      exit={{ opacity: 0, y: -200, transition: { duration: 10 } }}
    >
      <>
        <span className="font-bold">{comment.user}:</span> {comment.text}
      </>
    </motion.div>
  );
};

export default Comment;
