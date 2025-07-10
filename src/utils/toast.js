import { toast as hotToast } from 'react-hot-toast';

// Custom toast functions with improved styling and swipe support
export const toast = {
  success: (message, options = {}) => {
    return hotToast.success(message, {
      duration: 4000,
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
        maxWidth: '400px',
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
      ...options,
    });
  },

  error: (message, options = {}) => {
    return hotToast.error(message, {
      duration: 5000,
      style: {
        background: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
        maxWidth: '400px',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
      ...options,
    });
  },

  info: (message, options = {}) => {
    return hotToast(message, {
      duration: 4000,
      style: {
        background: '#eff6ff',
        color: '#1d4ed8',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
        maxWidth: '400px',
      },
      icon: 'ℹ️',
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return hotToast.loading(message, {
      style: {
        background: '#f9fafb',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
        maxWidth: '400px',
      },
      ...options,
    });
  },

  promise: (promise, messages, options = {}) => {
    return hotToast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    }, {
      style: {
        background: '#fff',
        color: '#374151',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
        maxWidth: '400px',
      },
      success: {
        style: {
          background: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0',
        }
      },
      error: {
        style: {
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        }
      },
      ...options,
    });
  },

  dismiss: (toastId) => {
    return hotToast.dismiss(toastId);
  },

  remove: (toastId) => {
    return hotToast.remove(toastId);
  }
};

export default toast;
