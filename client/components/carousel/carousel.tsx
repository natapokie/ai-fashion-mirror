'use client';

import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import { ProductData } from '../../../shared/types';
import CarouselCard from './carouselCard';
import styles from './style.module.css';

interface CarouselProps {
  products: ProductData[];
}

const Carousel: React.FC<CarouselProps> = ({ products }) => {
  const [grabbing, setGrabbing] = useState<boolean>(false);

  const [primaryIndex, setPrimaryIndex] = useState<number>(0);
  const [secondaryLeftIndex, setSecondaryLeftIndex] = useState<number>(1);
  const [secondaryRightIndex, setSecondaryRightIndex] = useState<number>(products.length - 1);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const movementXRef = useRef<number>(0);

  const handleMouseDown = () => {
    setGrabbing(true);
    movementXRef.current = 0;
  };

  const handleMouseMove = (event: Event) => {
    if (!grabbing) return;

    const mouseEvent = event as unknown as MouseEvent;
    movementXRef.current += mouseEvent.movementX;
  };

  const handleMouseUp = () => {
    setGrabbing(false);

    // Check the accumulated movement to adjust index
    if (movementXRef.current > 0) {
      // shift left
      setPrimaryIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
    } else if (movementXRef.current < 0) {
      // shift right
      setPrimaryIndex((prevIndex) => (prevIndex + 1) % products.length);
    }

    movementXRef.current = 0; // Reset after handling
  };

  useEffect(() => {
    // Update secondary indexes
    setSecondaryRightIndex((primaryIndex + 1) % products.length);
    setSecondaryLeftIndex((primaryIndex - 1 + products.length) % products.length);
  }, [products, primaryIndex]);

  useEffect(() => {
    const carouselElement = carouselRef.current;

    if (grabbing && carouselElement) {
      // add event listeners
      carouselElement.addEventListener('mousemove', handleMouseMove);
      carouselElement.addEventListener('touchend', handleMouseUp);

      carouselElement.addEventListener('pointermove', handleMouseMove);
      carouselElement.addEventListener('pointerup', handleMouseUp);
    } else if (carouselElement) {
      // remove event listeners
      carouselElement.removeEventListener('mousemove', handleMouseMove);
      carouselElement.removeEventListener('mouseup', handleMouseUp);

      carouselElement.removeEventListener('pointermove', handleMouseMove);
      carouselElement.removeEventListener('pointerup', handleMouseUp);
    }

    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('mousemove', handleMouseMove);
        carouselElement.removeEventListener('mouseup', handleMouseUp);

        carouselElement.removeEventListener('pointermove', handleMouseMove);
        carouselElement.removeEventListener('pointerup', handleMouseUp);
      }
    };
  }, [grabbing]);

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
            className={`${styles.baseCard} ${i === primaryIndex ? styles.primaryCard : i === secondaryLeftIndex || i === secondaryRightIndex ? styles.secondaryCard : styles.hiddenCard} ${secondaryLeftIndex === i ? styles.secondaryCardLeft : ''} ${
              secondaryRightIndex === i ? styles.secondaryCardRight : ''
            }`}
          >
            <CarouselCard name={product.name} image={product.image} />
          </div>
        ))}
      </div>
      <div className={styles.feedbackCard}>
        <p className="text-xl">{products[primaryIndex].feedback}</p>
      </div>
    </div>
  );
};

export default Carousel;
