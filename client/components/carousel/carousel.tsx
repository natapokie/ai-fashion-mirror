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
    if (movementXRef.current > 100) {
      setIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
    } else if (movementXRef.current < -100) {
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
      carouselElement.addEventListener('mouseup', handleMouseUp);
    } else if (carouselElement) {
      console.log('removing event lisener');
      carouselElement.removeEventListener('mousemove', handleMouseMove);
      carouselElement.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('mousemove', handleMouseMove);
        carouselElement.removeEventListener('mouseup', handleMouseUp);
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
          className={`${grabbing ? styles.active : ''} w-full flex flex-row cursor-grab`}
          onMouseDown={handleMouseDown}
          onMouseLeave={() => setGrabbing(false)}
        >
          {displayedProducts.map((product, index) => (
            <div key={index}>
              <CarouselCard name={product.name} image={product.image} />
            </div>
          ))}

          {/* <div>
            <CarouselCard name={displayedProducts[0].name} image={displayedProducts[0].image} />
          </div>

          <div>
            <CarouselCard name={displayedProducts[1].name} image={displayedProducts[1].image} />
          </div>

          <div
            draggable
            onDragEnd={(event) => {
              console.log('onDragEnd', displayedProducts[2].name);
              event.preventDefault();
              event.stopPropagation();
              setIndex((index + 1) % products.length);
              setDisplayedProducts(getCenteredSection(products, index));
            }}
          >
            <CarouselCard name={displayedProducts[2].name} image={displayedProducts[2].image} />
          </div> */}
        </div>
      )}
    </div>
  );
};

export default Carousel;
