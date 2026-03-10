
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
}

const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try refreshing the page."
}) => {
  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <Card className="border-red-200 bg-red-50 max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-red-700 mb-4">{description}</p>
        
        {error && (
          <details className="text-left mb-4 p-3 bg-red-100 rounded text-xs">
            <summary className="cursor-pointer font-medium text-red-800 mb-2">
              Technical Details
            </summary>
            <pre className="text-red-600 overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        
        <Button 
          onClick={handleRefresh}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
};

export default ErrorBoundaryFallback;
