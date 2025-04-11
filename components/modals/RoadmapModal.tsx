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
  const [imageLoading, setImageLoading] = useState(false); // Loading state for navigation
  const [showLoader, setShowLoader] = useState(true); // Control loader visibility
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0])); // Track loaded images
  const { modalClose } = useMainModal();
  const loaderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Motion values for drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Add state to track viewport dimensions
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // Reset zoom (used by other functions)
  const resetZoom = useCallback(() => {
    setIsZoomed(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Functions to navigate between images
  const nextImage = useCallback(() => {
    if (isZoomed) resetZoom(); // Reset zoom when changing image
    const nextIndex = currentImageIndex === imageCount - 1 ? 0 : currentImageIndex + 1;
    
    // Only show loading if this image hasn't been loaded yet
    if (!loadedImages.has(nextIndex)) {
      setImageLoading(true);
      // Show loader only if image takes more than 100ms to load
      if (loaderTimeoutRef.current) {
        clearTimeout(loaderTimeoutRef.current);
      }
      loaderTimeoutRef.current = setTimeout(() => {
        if (!loadedImages.has(nextIndex)) {
          setShowLoader(true);
        }
      }, 100);
    }
    
    setCurrentImageIndex(nextIndex);
  }, [isZoomed, resetZoom, imageCount, currentImageIndex, loadedImages]);

  const prevImage = useCallback(() => {
    if (isZoomed) resetZoom(); // Reset zoom when changing image
    const prevIndex = currentImageIndex === 0 ? imageCount - 1 : currentImageIndex - 1;
    
    // Only show loading if this image hasn't been loaded yet
    if (!loadedImages.has(prevIndex)) {
      setImageLoading(true);
      // Show loader only if image takes more than 100ms to load
      if (loaderTimeoutRef.current) {
        clearTimeout(loaderTimeoutRef.current);
      }
      loaderTimeoutRef.current = setTimeout(() => {
        if (!loadedImages.has(prevIndex)) {
          setShowLoader(true);
        }
      }, 100);
    }
    
    setCurrentImageIndex(prevIndex);
  }, [isZoomed, resetZoom, imageCount, currentImageIndex, loadedImages]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    if (!isZoomed) {
      setIsZoomed(true);
    }
  }, [isZoomed]);
  
  const zoomOut = useCallback(() => {
    resetZoom();
  }, [resetZoom]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    // Clear any pending loader timeout
    if (loaderTimeoutRef.current) {
      clearTimeout(loaderTimeoutRef.current);
      loaderTimeoutRef.current = null;
    }
    
    // Hide loader immediately to prevent flashing
    setShowLoader(false);
    setTimeout(() => {
      setImageLoading(false);
    }, 100);
    
    // Mark this image as loaded
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(currentImageIndex);
      return newSet;
    });
    
    // Preload adjacent images for smooth navigation
    const preloadAdjacentImages = () => {
      const nextIdx = (currentImageIndex + 1) % imageCount;
      const prevIdx = (currentImageIndex - 1 + imageCount) % imageCount;
      
      [nextIdx, prevIdx].forEach(idx => {
        if (!loadedImages.has(idx)) {
          const img = document.createElement('img');
          img.src = `/images/Roadmap${idx + 1}.svg`;
          img.onload = () => {
            setLoadedImages(prev => {
              const newSet = new Set(prev);
              newSet.add(idx);
              return newSet;
            });
          };
        }
      });
    };
    
    preloadAdjacentImages();
  }, [currentImageIndex, imageCount, loadedImages]);

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Initial call to set correct dimensions
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Function to adjust container size based on viewport
  const containerStyle = useCallback(() => {
    // Calculate optimal height based on viewport
    const optimalHeight = Math.max(300, viewport.height * 0.8 - 120);
    
    return {
      minHeight: '40vh',
      maxHeight: `${optimalHeight}px`
    };
  }, [viewport.height]);

  // Preload all images on initial load
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = Array.from({ length: imageCount }).map((_, index) => {
        return new Promise<number>((resolve) => {
          const img = document.createElement('img');
          img.src = `/images/Roadmap${index + 1}.svg`;
          img.onload = () => {
            setLoadedImages(prev => {
              const newSet = new Set(prev);
              newSet.add(index);
              return newSet;
            });
            resolve(index);
          };
          img.onerror = () => resolve(index); // Still resolve on error to prevent hanging
        });
      });

      await Promise.all(imagePromises);
      // Fade out the initial loading state
      setShowLoader(false);
      setTimeout(() => {
        setInitialLoading(false);
      }, 300);
    };

    preloadImages();
    
    // Cleanup any timeouts on unmount
    return () => {
      if (loaderTimeoutRef.current) {
        clearTimeout(loaderTimeoutRef.current);
      }
    };
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
        style={containerStyle()}
      >
        <AnimatePresence>
          {(initialLoading || (imageLoading && showLoader)) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-gray-900/80 z-10"
            >
              <div className="w-8 h-8 border-4 border-primaryColor/30 border-t-primaryColor rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-500">
                {initialLoading ? "Loading roadmap images..." : "Loading image..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Responsive container */}
        <div className="w-full absolute inset-0 flex items-center justify-center">
          {/* Empty div to maintain stable dimensions */}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }}
            className="w-full flex items-center justify-center h-auto py-6 px-4"
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
                duration: 0.5,
                stiffness: 200,
                damping: 30
              }}
              className={`relative ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
            >
              <div className="relative flex items-center justify-center">
                <Image
                  src={`/images/Roadmap${currentImageIndex + 1}.svg`}
                  alt={`Roadmap step ${currentImageIndex + 1}`}
                  className="object-contain select-none"
                  width={800}
                  height={600}
                  style={{ 
                    maxHeight: `calc(${viewport.height * 0.75}px - 80px)`, 
                    width: 'auto',
                    maxWidth: `calc(${viewport.width * 0.9}px - 40px)`
                  }}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  priority={true}
                  onLoad={handleImageLoad}
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
          disabled={imageLoading}
        >
          <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>

        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors z-20"
          aria-label="Next image"
          disabled={imageLoading}
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
              disabled={imageLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoadmapModal; 