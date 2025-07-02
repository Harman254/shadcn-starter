'use client'
import React, { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from './ui/button';

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  uploadPreset: string;
  buttonText?: string;
  label?: string;
  helperText?: string;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  onUpload,
  uploadPreset,
  buttonText = 'Upload Image',
  label = 'Image Upload',
  helperText = 'Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB.',
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
      <label className="block text-lg font-semibold mb-2 text-zinc-800 dark:text-zinc-100">{label}</label>
      <CldUploadWidget
        uploadPreset={uploadPreset}
        onUpload={(result: any) => {
          if (result?.event === 'success' && result?.info?.secure_url) {
            setImageUrl(result.info.secure_url);
            onUpload(result.info.secure_url);
          }
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            onClick={() => open?.()}
            className="mb-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-2 px-4 rounded shadow"
          >
            {buttonText}
          </Button>
        )}
      </CldUploadWidget>
      <span className="text-xs text-zinc-500 mb-4 text-center">{helperText}</span>
      {imageUrl && (
        <div className="mt-4 w-full flex flex-col items-center">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="max-w-xs max-h-48 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg object-cover"
          />
          <span className="text-xs text-green-600 mt-2">Upload successful!</span>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload; 