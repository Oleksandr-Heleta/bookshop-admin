"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash, ImagePlus } from "lucide-react";
import DragDropFiles from "@/components/ui/drag-drop";
import { set } from "date-fns";
import { number } from "zod";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
  multipe?: boolean;
}

export const ImageUploading: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
  multipe,
}) => {
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(value);
  const [isMounted, setIsMounted] = useState(false);
  const [dragDropOpen, setDragDropOpen] = useState(false);
  const [dragItemIndex, setDragItemIndex] = useState<number | undefined>();
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | undefined>();

  useEffect(() => {
    setIsMounted(true);
    
  }, []);

  useEffect(() => {
    // console.log("images updated", images);
  }, [images]);

  const handleDragStart = (index: number) => {
    setDragItemIndex(index)
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  }

  const handleDrop = () => {
    const _images = [...images];
    if (dragItemIndex !== undefined && dragOverItemIndex !== undefined) {
      const dragItem = _images.splice(dragItemIndex, 1);
      _images.splice(dragOverItemIndex, 0, ...dragItem);
      setImages(_images);
    }
  }

  const handleDragEnter = (index: number) => {
    setDragOverItemIndex(index)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    setDragOverItemIndex(undefined)
  }

  const handleDragEnd = (event: React.DragEvent) => {
    setDragItemIndex(undefined);
    setDragOverItemIndex(undefined);
    onChange(images);
  }


  const handleUploadComplete = async (urls: string[]) => {
    if(!multipe){
      
      for (const img of images) {
        await onDelete(img);
      }
      
      setImages([...urls]);
      onChange([...urls]);
      
    } else {
    setImages([...images, ...urls]);
    onChange([...images, ...urls]);
    }
  };




  const onDelete = async (url: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: url }),
      });

      if (!res.ok) throw new Error(await res.text());
      setImages(images.filter((img) => img !== url));
      onRemove(url);
      toast.success("Зображення видалено.");
    } catch (e: any) {
      toast.error("Помилка видалення.");
      console.error(e);
    }finally {
      setLoading(false);
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <DragDropFiles isOpen={dragDropOpen} multipe={multipe}  onClose={() => setDragDropOpen(false)} onUploadComplete={handleUploadComplete}/>
      <div className="flex mb-4 items-center gap-4">
      {images.length > 0 &&
        images.map((url, i) => (
          <div
            key={i}
            className="relative w-[200px] h-[200px] border rounded-md overflow-hiden"
            draggable={multipe}
            onDragStart={() => handleDragStart(i)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop()}
            onDragEnter={() => handleDragEnter(i)}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                disabled={loading}
                type="button"
                onClick={() => onDelete(url)}
                variant="destructive"
                size="icon"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-contain" src={url} alt={`Image ${url}`} />
          </div>
        ))}
        </div>

      <div >
        {/* <Input
        className="w-1/3 mb-5"
          type="file"
          name="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0])}
        /> */}
        {!multipe && images.length > 0 && (<p className="text-sm text-gray-500 mb-2">Зображення видалиться при завантаженні нового</p>)}
        <Button
          type="button"
          disabled={disabled}
          variant="secondary"
          // onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onUpload(e)}
            onClick={()=>{setDragDropOpen(true)}}
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          Завантажити зображення
        </Button>
      </div>
    </div>
  );
}
