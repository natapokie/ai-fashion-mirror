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
      animate={{ opacity: 1, y: 0, transition: { duration: 3, delay:2 } }}
      exit={{ opacity: 0, y: -600, transition: { duration: 10, delay:1 } }}
    >
      <>
        <h3>
          <span className="font-extrabold">{comment.user}: </span> 
          <span className=''>{comment.text}</span>
        </h3>
      </>
    </motion.div>
  );
};

export default Comment;
