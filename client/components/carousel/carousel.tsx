'use client';

import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import { ProductData } from '../../../shared/types';
import CarouselCard from './carouselCard';
import styles from './style.module.css';

interface CarouselProps {
  products: ProductData[];
}

const Carousel: React.FC<CarouselProps> = ({ products }) => {
  const [index, setIndex] = useState<number>(0);
  const [displayedProducts, setDisplayedProducts] = useState<ProductData[]>([]);
  const [grabbing, setGrabbing] = useState<boolean>(false);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const movementXRef = useRef<number>(0);

  const getCenteredSection = (arr: ProductData[], index: number): ProductData[] => {
    const length = arr.length;
    const result = [
      arr[(index - 1 + length) % length], // Element before the index
      arr[index], // Center element
      arr[(index + 1) % length], // Element after the index
    ];
    return result;
  };

  const handleMouseDown = () => {
    console.log('handleMouseDown');
    setGrabbing(true);
    movementXRef.current = 0;
  };

  const handleMouseMove = (event: Event) => {
    if (!grabbing) return;

    const mouseEvent = event as unknown as MouseEvent;
    movementXRef.current += mouseEvent.movementX;
  };

  const handleMouseUp = () => {
    console.log('handleMouseUp', movementXRef.current);
    setGrabbing(false);

    // Check the accumulated movement to adjust index
    if (movementXRef.current > 0) {
      console.warn('shift left');
      setIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
    } else if (movementXRef.current < 0) {
      console.warn('shift right');
      setIndex((prevIndex) => (prevIndex + 1) % products.length);
    }

    movementXRef.current = 0; // Reset after handling
  };

  useEffect(() => {
    // get the initial displayed products
    setDisplayedProducts(getCenteredSection(products, index));
  }, [products, index]);

  useEffect(() => {
    console.log('grabbing', grabbing, carouselRef);
    const carouselElement = carouselRef.current;

    if (grabbing && carouselElement) {
      console.log('adding event lisener');
      carouselElement.addEventListener('mousemove', handleMouseMove);
      carouselElement.addEventListener('touchend', handleMouseUp);

      carouselElement.addEventListener('pointermove', handleMouseMove);
      carouselElement.addEventListener('pointerup', handleMouseUp);
    } else if (carouselElement) {
      console.log('removing event lisener');
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

  useEffect(() => {
    console.log('index', index);
    setDisplayedProducts(getCenteredSection(products, index));
  }, [index]);

  return (
    <div>
      {displayedProducts.length > 0 && (
        <div
          ref={carouselRef}
          className={`${grabbing ? styles.active : ''} w-full flex flex-row justify-center items-center cursor-grab touch-none`}
          onMouseDown={handleMouseDown}
          onMouseLeave={() => setGrabbing(false)}
          onPointerDown={handleMouseDown}
        >
          {displayedProducts.map((product, i) => (
            <div
              key={i}
              className={`${styles.baseCard} ${i === 1 ? styles.primaryCard : styles.secondaryCard}`}
            >
              <CarouselCard name={product.name} image={product.image} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
