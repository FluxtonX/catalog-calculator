import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-950">
      <Card className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-emerald-500">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button 
            icon={Home}
            onClick={() => navigate('/valuation')}
          >
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;