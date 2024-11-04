'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ProductData } from '../../../shared/types';
import CarouselCard from './carouselCard';
import styles from './style.module.css';

interface CarouselProps {
  products: ProductData[];
  onClickOutside: () => void;
}

const Carousel: React.FC<CarouselProps> = ({ products, onClickOutside }) => {
  const [grabbing, setGrabbing] = useState(false);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [secondaryLeftIndex, setSecondaryLeftIndex] = useState(1);
  const [secondaryRightIndex, setSecondaryRightIndex] = useState(products.length - 1);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const movementXRef = useRef(0);

  const handleMouseDown = () => {
    setGrabbing(true);
    movementXRef.current = 0;
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!grabbing) return;
    movementXRef.current += event.movementX;
  };

  const handleMouseUp = () => {
    setGrabbing(false);
    if (movementXRef.current > 0) {
      setPrimaryIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
    } else if (movementXRef.current < 0) {
      setPrimaryIndex((prevIndex) => (prevIndex + 1) % products.length);
    }
    movementXRef.current = 0;
  };

  useEffect(() => {
    setSecondaryRightIndex((primaryIndex + 1) % products.length);
    setSecondaryLeftIndex((primaryIndex - 1 + products.length) % products.length);
  }, [primaryIndex, products]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        carouselRef.current &&
        !carouselRef.current.contains(event.target as Node) &&
        feedbackRef.current &&
        !feedbackRef.current.contains(event.target as Node)
      ) {
        onClickOutside(); // Call the handler to exit the carousel
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClickOutside]);

  return (
    <div className="flex flex-col items-center gap-7 p-5">
      <div
        ref={carouselRef}
        className={`${grabbing ? styles.active : ''} w-full h-[500px] cursor-grab touch-none relative`}
        onMouseDown={handleMouseDown}
        onMouseLeave={() => setGrabbing(false)}
        onPointerDown={handleMouseDown}
      >
        {products.map((product, i) => (
          <div
            key={i}
            className={`${styles.baseCard} ${
              i === primaryIndex ? styles.primaryCard : i === secondaryLeftIndex || i === secondaryRightIndex ? styles.secondaryCard : styles.hiddenCard
            } ${secondaryLeftIndex === i ? styles.secondaryCardLeft : ''} ${
              secondaryRightIndex === i ? styles.secondaryCardRight : ''
            }`}
          >
            <CarouselCard name={product.name} image={product.image} />
          </div>
        ))}
      </div>
      <div ref={feedbackRef} className={styles.feedbackCard}>
        <p className="text-xl">{products[primaryIndex].feedback}</p>
      </div>
    </div>
  );
};

export default Carousel;