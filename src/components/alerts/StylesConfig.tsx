
import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface AlertStyle {
  bgColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
  text: string; // Add this field to fix the error
  icon: React.ReactNode;
}

export const getSeverityStyles = (severity: string): AlertStyle => {
  switch (severity) {
    case 'high':
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        textColor: 'text-red-800',
        text: 'text-red-800', // Add this value to fix the error
        icon: <AlertCircle className="text-red-600" size={20} />
      };
    case 'medium':
      return {
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        iconColor: 'text-amber-600',
        textColor: 'text-amber-800',
        text: 'text-amber-800', // Add this value to fix the error
        icon: <AlertTriangle className="text-amber-600" size={20} />
      };
    case 'low':
    default:
      return {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-800',
        text: 'text-blue-800', // Add this value to fix the error
        icon: <Info className="text-blue-600" size={20} />
      };
  }
};
