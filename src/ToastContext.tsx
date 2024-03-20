// ToastContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ToastContextType = {
  showToast: (msg: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [message, setMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setMessage(msg);
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isVisible && <Toast message={message} />}
    </ToastContext.Provider>
  );
};

type ToastProps = {
  message: string;
};

const Toast = ({ message }: ToastProps) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'black',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
    }}>
      {message}
    </div>
  );
};
