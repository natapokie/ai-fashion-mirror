'use client';

import React from 'react';
import styles from './style.module.css';

// Define the props interface
interface CarouselCardProps {
  name: string;
  image: string;
}

const CarouselCard: React.FC<CarouselCardProps> = ({ name, image }) => {
  return (
    <div className={styles.carouselCard}>
      {image && <img src={image} alt={name} className={styles.productImage}></img>}
      <div className={styles.gradientOverlay}></div>
      <p className={styles.productName}>{name}</p>
    </div>
  );
};

export default CarouselCard;
