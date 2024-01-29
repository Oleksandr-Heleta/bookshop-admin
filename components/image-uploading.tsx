// ImageUploader.tsx
"use client";
import React, { useState,  useEffect} from 'react';

const ImageUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      console.log(file);
      setSelectedFile(file);
    }
  };

  const handleUpload = async (event) => {
   

    event.stopPropagation();
    if (selectedFile) {
      console.log(selectedFile);
      const formData = new FormData();
      formData.append('image', selectedFile);
      console.log(formData);

      // Replace '/api/upload' with the endpoint where your server handles file uploads
      fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('File uploaded successfully!', data);
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    }
  };

  return (
    <form>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {selectedFile && (
        <div>
          <p>Selected File: {selectedFile.name}</p>
          <img src={`/assets/images/${selectedFile.name}`} alt="Uploaded" width={200} height={200} />
        </div>
      )}
    </form>
  );
};

export default ImageUploader;
