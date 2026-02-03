"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface GallerySliderProps {
  images: GalleryImage[];
  autoPlay?: boolean;
  interval?: number;
  showThumbnails?: boolean;
}

export function GallerySlider({
  images,
  autoPlay = true,
  interval = 5000,
  showThumbnails = true,
}: GallerySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || isFullscreen) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, isFullscreen, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "Escape") setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, nextSlide, prevSlide]);

  if (images.length === 0) return null;

  return (
    <div className="w-full">
      {/* Main Slider */}
      <div
        className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Images */}
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-in-out",
              index === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            )}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Caption */}
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-white text-lg md:text-xl font-medium drop-shadow-lg">
                  {image.caption}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="View fullscreen"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        {autoPlay && !isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-white/60 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / images.length) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all",
                index === currentIndex
                  ? "ring-2 ring-green-500 ring-offset-2"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Fullscreen Image */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Fullscreen Navigation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Fullscreen Caption */}
          {images[currentIndex].caption && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <p className="text-white text-xl font-medium drop-shadow-lg">
                {images[currentIndex].caption}
              </p>
              <p className="text-white/60 text-sm mt-2">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          )}

          {/* Fullscreen Thumbnails */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
