import React from 'react'
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Loading() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/loading/my-enrollments') {
      const timer = setTimeout(() => {
        navigate('/my-enrollments', { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='w-16 sm:w-20 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin'></div>
    </div>
  )
}
 
export default Loading