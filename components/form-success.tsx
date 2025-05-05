import React from 'react';
import { Check } from 'lucide-react';

type FormSuccessProps = {
  message?: string;
}

const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;
  
  return (
    <div className="bg-green-50 border border-green-200 p-3 rounded-md flex items-center gap-x-2 text-sm text-green-800">
      <Check className="w-4 h-4 text-green-500" />
      {message}
    </div>
  );
};

export default FormSuccess;