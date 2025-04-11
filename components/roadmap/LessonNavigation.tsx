import React from 'react';
import { PiArrowLeft, PiArrowRight } from 'react-icons/pi';

interface LessonNavigationProps {
  currentLessonId: number;
  totalLessons: number;
  onPrevious: () => void;
  onNext: () => void;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({
  currentLessonId,
  totalLessons,
  onPrevious,
  onNext
}) => {
  return (
    <div className="flex justify-between items-center p-4 border-t border-primaryColor/20 bg-primaryColor/5">
      <button
        onClick={onPrevious}
        disabled={currentLessonId <= 1}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          currentLessonId <= 1
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-primaryColor hover:text-white text-primaryColor border border-primaryColor/30'
        }`}
      >
        <PiArrowLeft className="text-lg" />
        <span>Previous</span>
      </button>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {currentLessonId} / {totalLessons}
      </div>
      
      <button
        onClick={onNext}
        disabled={currentLessonId >= totalLessons}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          currentLessonId >= totalLessons
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-primaryColor hover:text-white text-primaryColor border border-primaryColor/30'
        }`}
      >
        <span>Next</span>
        <PiArrowRight className="text-lg" />
      </button>
    </div>
  );
};

export default LessonNavigation; 