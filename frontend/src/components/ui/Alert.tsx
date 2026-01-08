import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import React from 'react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'destructive';
  title?: string;
  message?: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  children,
  onClose,
}) => {
  // Map 'destructive' to 'error' for shadcn-ui compatibility
  const actualVariant = variant === 'destructive' ? 'error' : variant;
  
  const variants = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info },
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: AlertTriangle },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertCircle },
  };

  const config = variants[actualVariant];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 flex items-start gap-3`}>
      <Icon className={`h-5 w-5 ${config.text} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        {title && <h4 className={`font-semibold ${config.text} mb-1`}>{title}</h4>}
        {message && <p className={`text-sm ${config.text}`}>{message}</p>}
        {children && <div className={`text-sm ${config.text}`}>{children}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Additional exports for shadcn-ui compatibility
interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ 
  children, 
  className = '' 
}) => {
  return <div className={`text-sm ${className}`}>{children}</div>;
};
