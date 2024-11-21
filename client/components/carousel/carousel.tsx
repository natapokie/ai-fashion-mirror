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

  const handleSliderClick = (index: number) => {
    setPrimaryIndex(index);
  };

  useEffect(() => {
    setSecondaryRightIndex((primaryIndex + 1) % products.length);
    setSecondaryLeftIndex((primaryIndex - 1 + products.length) % products.length);
  }, [primaryIndex, products]);

  useEffect(() => {
    // mouse events to enable carousel drag and scroll
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
    <div className="w-full h-full flex flex-col items-center gap-7 p-5">
      {/* dummy container to handle outside clicks */}
      <div
        onClick={() => {
          onClickOutside();
        }}
        className="flex-1 w-full z-[1]"
      ></div>
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
              i === primaryIndex
                ? styles.primaryCard
                : i === secondaryLeftIndex || i === secondaryRightIndex
                  ? styles.secondaryCard
                  : styles.hiddenCard
            } ${secondaryLeftIndex === i ? styles.secondaryCardLeft : ''} ${
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
      <div className="flex flex-row gap-4">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => handleSliderClick(i)}
            className={`${styles.sliderThumb} ${i === primaryIndex ? styles.sliderThumbFocus : styles.sliderThumbUnFocus}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
