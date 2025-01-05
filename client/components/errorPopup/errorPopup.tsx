import React from 'react';
import styles from './style.module.css';

type ErrorPopupProps = {
  message: string;          // Custom error message
  onClose: () => void;      // Callback for the "OK" button
};

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2 className={styles.title}>Error</h2>
        <p className={styles.message}>{message}</p>
        <button className={styles.button} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup;