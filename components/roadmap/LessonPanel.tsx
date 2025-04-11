import React, { useState } from 'react';
import { lessonData } from './lessonData';
import LessonContent from './LessonContent';
import LessonNavigation from './LessonNavigation';

const LessonPanel: React.FC = () => {
  const [currentLessonId, setCurrentLessonId] = useState(1);
  
  const currentLesson = lessonData.find(lesson => lesson.id === currentLessonId) || lessonData[0];
  
  const handlePrevious = () => {
    if (currentLessonId > 1) {
      setCurrentLessonId(currentLessonId - 1);
    }
  };
  
  const handleNext = () => {
    if (currentLessonId < lessonData.length) {
      setCurrentLessonId(currentLessonId + 1);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1A1915] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-primaryColor/20 bg-primaryColor/5">
        <h2 className="text-lg font-semibold text-primaryColor">Data Engineering Roadmap</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-[#23262B] px-3 py-1 rounded-full border border-primaryColor/20">
          Lesson {currentLessonId} of {lessonData.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        <LessonContent lesson={currentLesson} />
      </div>
      
      <LessonNavigation
        currentLessonId={currentLessonId}
        totalLessons={lessonData.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
};

export default LessonPanel; 