"use client";
import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";

const heroImage = [
  { imgUrl: "/assets/images/hero-1.svg", alt: "smartwatch" },
  { imgUrl: "/assets/images/hero-2.svg", alt: "bag" },
  { imgUrl: "/assets/images/hero-3.svg", alt: "lamp" },
  { imgUrl: "/assets/images/hero-4.svg", alt: "air fryer" },
  { imgUrl: "/assets/images/hero-5.svg", alt: "chair" },
];

const HeroCarousel = () => {
  return (
    <>
      <div className="hero-carousel">
        <Carousel
          showThumbs={false}
          // autoPlay
          infiniteLoop
          // interval={2000}
          showArrows={false}
          showStatus={false}
        >
          {heroImage.map((image) => (
            <Image
              src={image.imgUrl}
              alt={image.alt}
              width={100}
              height={100}
              className="object-fit"
              key={image.alt}
            />
          ))}
        </Carousel>
      </div>
      <Image
        src="assets/icons/hand-drawn-arrow.svg"
        alt="arrow"
        width={200}
        height={200}
        className="max-lg:hidden absolute right-[20rem] bottom-[-60px]"
      />
    </>
  );
};

export default HeroCarousel;
