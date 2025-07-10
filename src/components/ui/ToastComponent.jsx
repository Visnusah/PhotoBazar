import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

const ToastComponent = ({ 
  toast, 
  onDismiss, 
  type = 'info', 
  message, 
  duration = 4000,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    
    // If dragged more than 100px to the right or velocity is high, dismiss
    if (offset.x > 100 || velocity.x > 500) {
      handleDismiss();
    } else {
      // Snap back to original position
      setDragX(0);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.3 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.3 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          drag="x"
          dragConstraints={{ left: 0, right: 300 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05 }}
          className={`
            relative flex items-center p-4 mb-3 rounded-lg shadow-lg border
            ${getBackgroundColor()}
            cursor-grab active:cursor-grabbing
            select-none
            ${className}
          `}
          style={{
            x: dragX,
            maxWidth: '400px',
            minWidth: '300px',
          }}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>

          {/* Message */}
          <div className="flex-1 text-sm font-medium text-gray-900">
            {message}
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-gray-500" />
          </button>

          {/* Swipe Indicator */}
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-30 rounded-r-lg"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastComponent;
