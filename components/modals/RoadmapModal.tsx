"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMainModal } from "@/stores/modal";
import { motion, AnimatePresence, useMotionValue, useDragControls } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomOut } from "lucide-react";
import Image from "next/image";

function RoadmapModal() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageCount] = useState(10); // There are 10 roadmap images
  const [initialLoading, setInitialLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { modalClose } = useMainModal();
  
  // Motion values for drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Reset zoom (used by other functions)
  const resetZoom = useCallback(() => {
    setIsZoomed(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Functions to navigate between images
  const nextImage = useCallback(() => {
    if (isZoomed) resetZoom(); // Reset zoom when changing image
    setCurrentImageIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
  }, [isZoomed, resetZoom, imageCount]);

  const prevImage = useCallback(() => {
    if (isZoomed) resetZoom(); // Reset zoom when changing image
    setCurrentImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  }, [isZoomed, resetZoom, imageCount]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    if (!isZoomed) {
      setIsZoomed(true);
    }
  }, [isZoomed]);
  
  const zoomOut = useCallback(() => {
    resetZoom();
  }, [resetZoom]);

  // Handle drag when zoomed
  const handleDragStart = useCallback(() => {
    if (isZoomed) {
      setIsDragging(true);
    }
  }, [isZoomed]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!isZoomed && !isDragging) {
      zoomIn();
    }
  }, [isZoomed, isDragging, zoomIn]);

  // Calculate drag constraints based on zoom level and container size
  const calculateConstraints = useCallback(() => {
    if (!isZoomed || !containerRef.current || !imageRef.current) return { top: 0, right: 0, bottom: 0, left: 0 };
    
    const zoomScale = 2; // Same as the scale value in the motion.div
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    // Calculate the scaled image dimensions
    const scaledWidth = imageRect.width * zoomScale;
    const scaledHeight = imageRect.height * zoomScale;
    
    // Calculate drag boundaries (how far the image can move)
    const horizontalConstraint = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const verticalConstraint = Math.max(0, (scaledHeight - containerRect.height) / 2);
    
    return {
      top: -verticalConstraint,
      right: horizontalConstraint,
      bottom: verticalConstraint,
      left: -horizontalConstraint
    };
  }, [isZoomed, containerRef, imageRef]);

  // Preload all images on initial load
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = Array.from({ length: imageCount }).map((_, index) => {
        return new Promise<number>((resolve) => {
          const img = document.createElement('img');
          img.src = `/images/Roadmap${index + 1}.svg`;
          img.onload = () => {
            resolve(index);
          };
          img.onerror = () => resolve(index); // Still resolve on error to prevent hanging
        });
      });

      await Promise.all(imagePromises);
      setInitialLoading(false);
    };

    preloadImages();
  }, [imageCount]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") {
        if (isZoomed) {
          resetZoom();
        } else {
          modalClose();
        }
      }
      if (e.key === "z") zoomIn();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalClose, isZoomed, nextImage, prevImage, resetZoom, zoomIn]);

  // Update constraints when zoomed state changes
  useEffect(() => {
    if (isZoomed) {
      // Force a constraint calculation update
      calculateConstraints();
    }
  }, [isZoomed, calculateConstraints]);

  const constraints = calculateConstraints();

  return (
    <div className="relative w-full flex flex-col h-full overflow-hidden" ref={containerRef}>
      {/* Image carousel container */}
      <div 
        className="relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900 flex-1 flex items-center justify-center"
      >
        {initialLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-gray-900/80 z-10">
            <div className="w-8 h-8 border-4 border-primaryColor/30 border-t-primaryColor rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500">Loading roadmap images...</p>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center"
          >
            <motion.div
              ref={imageRef}
              drag={isZoomed}
              dragControls={dragControls}
              dragConstraints={constraints}
              dragElastic={0}
              dragMomentum={false}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={handleClick}
              style={{ 
                x,
                y,
                scale: isZoomed ? 2 : 1,
              }}
              transition={{ 
                type: "spring", 
                duration: 0.3,
                stiffness: 300,
                damping: 30
              }}
              className={`relative ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
            >
              <div className="relative max-h-[65vh] w-auto">
                <Image
                  src={`/images/Roadmap${currentImageIndex + 1}.svg`}
                  alt={`Roadmap step ${currentImageIndex + 1}`}
                  className="object-contain select-none"
                  width={800}
                  height={600}
                  style={{ maxHeight: '65vh', width: 'auto' }}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  priority={currentImageIndex === 0}
                />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors z-20"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>

        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors z-20"
          aria-label="Next image"
        >
          <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        
        {/* Zoom out button (only visible when zoomed) */}
        {isZoomed && (
          <button 
            onClick={zoomOut}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors z-20"
            aria-label="Zoom out"
          >
            <ZoomOut size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        )}
        
        {/* Display zoom instructions on first zoom */}
        {isZoomed && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full z-20"
          >
            Drag to move • Use button to exit zoom
          </motion.div>
        )}
      </div>

      {/* Pagination and info */}
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {currentImageIndex + 1} / {imageCount}
        </div>
        
        <div className="flex justify-center gap-1.5 flex-wrap">
          {Array.from({ length: imageCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentImageIndex 
                  ? "bg-primaryColor" 
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoadmapModal; 