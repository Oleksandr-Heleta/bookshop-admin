"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash, ImagePlus } from "lucide-react";
import DragDropFiles from "@/components/ui/drag-drop";
import { set } from "date-fns";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

export const ImageUploading: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(value);
  const [isMounted, setIsMounted] = useState(false);
  const [dragDropOpen, setDragDropOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
  
    if (!file) return;

    try {
      const data = new FormData();
      data.set("file", file);
     
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
     
      setImages([...images, `${process.env.NEXT_PUBLIC_IMAGE_STORE_URL}/${file.name}`]);
      const responseData = await res.json(); 
      onChange( `${process.env.NEXT_PUBLIC_IMAGE_STORE_URL}/${file.name}`);
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      // Handle errors here
      console.error(e);
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
    } catch (e: any) {
      // Handle errors here
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
      <DragDropFiles isOpen={dragDropOpen} />
      <div className="flex mb-4 items-center gap-4">
      {images.length > 0 &&
        images.map((url, i) => (
          <div
            key={i}
            className="relative w-[200px] h-[200px] border rounded-md overflow-hiden"
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
            <Image fill className="object-contain" src={url} alt="Image" />
          </div>
        ))}
        </div>

      <div >
        <Input
        className="w-1/3 mb-5"
          type="file"
          name="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
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
