'use client';

import React, { MouseEvent, useEffect, useState } from 'react';
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
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [scrollRight, setScrollRight] = useState<number>(0);

  const getCenteredSection = (arr: ProductData[], index: number): ProductData[] => {
    const length = arr.length;
    const result = [
      arr[(index - 1 + length) % length], // Element before the index
      arr[index], // Center element
      arr[(index + 1) % length], // Element after the index
    ];
    return result;
  };

  useEffect(() => {
    console.log(products);

    // get the initial displayed products
    setDisplayedProducts(getCenteredSection(products, index));
  }, [products]);

  const handleMouseDown = (event: React.MouseEvent) => {
    console.log('onMouseDown', event);
    setGrabbing(true);
  };

  const handleMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!grabbing) {
      return;
    }

    if (event.movementX > 0) {
      console.log('right', event.movementX);
      setScrollRight(scrollRight + event.movementX);
    } else {
      console.log('left', event.movementX);
      setScrollLeft(scrollLeft + event.movementX);
    }

    console.log(event);
  };

  useEffect(() => {
    console.log('index', index);
    setDisplayedProducts(getCenteredSection(products, index));
  }, [index]);

  useEffect(() => {
    if (grabbing) {
      return;
    }

    if (scrollRight > 100) {
      console.log('RIGHT: set index', (index + 1) % products.length);
      setIndex((index + 1) % products.length);
      // setDisplayedProducts(getCenteredSection(products, index));
      setScrollRight(0);
    } else if (scrollLeft < -100) {
      console.log('LEFT: set index', (index - 1) % products.length);
      setIndex((index - 1 + products.length) % products.length);
      // setDisplayedProducts(getCenteredSection(products, index));
      setScrollLeft(0);
    }
  }, [scrollLeft, scrollRight, grabbing]);

  return (
    <div>
      {displayedProducts.length > 0 && (
        <div
          className={`${grabbing ? styles.active : ''} w-full flex flex-row cursor-grab`}
          onMouseDown={handleMouseDown}
          onMouseLeave={() => {
            setGrabbing(false);
          }}
          onMouseUp={() => {
            setGrabbing(false);
          }}
          onMouseMove={handleMouseMove}
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
