import React from 'react';
import { LessonData } from './lessonData';
import ReactMarkdown from 'react-markdown';

interface LessonContentProps {
  lesson: LessonData;
}

const LessonContent: React.FC<LessonContentProps> = ({ lesson }) => {
  return (
    <div className="p-6 overflow-auto">
      <div className="prose prose-sm max-w-none dark:prose-invert dark:text-gray-300 
        prose-headings:text-primaryColor dark:prose-headings:text-primaryColor 
        prose-a:text-primaryColor dark:prose-a:text-primaryColor 
        prose-strong:text-primaryColor/90 dark:prose-strong:text-primaryColor/90
        prose-code:bg-gray-200 dark:prose-code:bg-gray-600 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-blue-700 dark:prose-code:text-blue-300
        prose-pre:bg-gray-200 dark:prose-pre:bg-gray-600 dark:prose-pre:text-blue-300">
        <ReactMarkdown>{lesson.section}</ReactMarkdown>

        {lesson.image && (
          <div className="mt-4 flex justify-center">
            <img 
              src={lesson.image} 
              alt={`Illustration for lesson ${lesson.id}`} 
              className="max-w-full h-auto rounded-lg shadow-md border border-primaryColor/20" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonContent; 