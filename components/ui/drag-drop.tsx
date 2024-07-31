import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import path from "path"; // Add this line to import the 'path' module
import { fi } from "date-fns/locale";

interface DragDropFilesProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (urls: string[]) => void;
  multipe?: boolean;
}

const DragDropFiles: React.FC<DragDropFilesProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  multipe,
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setFiles(event.dataTransfer.files);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    if (files) {
      Array.from(files).forEach((file, index) => {
        formData.append(`Files[${index}]`, file);
      });

      setLoading(true);
      try {
        // for (let [key, value] of formData.entries()) {
        //   console.log(`${key}:`, value);
        // }

        // console.log("Uploading files:", files);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error(await res.text());

        const responseData = await res.json();
        // console.log("Response data:", responseData);
        // const urls = responseData.map((file: { url: string }) => file.url);
        // console.log("Paths:", responseData.paths);
        // console.log("Base URL:", process.env.NEXT_PUBLIC_IMAGE_STORE_URL);

        const urls = responseData.paths.map((file: {filePath: string, fileName: string }) => {
          const fileName = file.fileName;
          // console.log("File Name:", fileName);
          return `${process.env.NEXT_PUBLIC_IMAGE_STORE_URL}/${fileName}`;
        });

        // console.log("URLs:", urls);
        // onChange( `${process.env.NEXT_PUBLIC_IMAGE_STORE_URL}/${file.name}`);
        // console.log("Upload complete:", urls);
        onUploadComplete(urls);
        toast.success("Зображення завантажено.");
        setFiles(null)
        onClose();
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Помилка завантаження.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (files)
    return (
      <Modal
        title="Завантаження зображень"
        description="Завантажте зображення тут."
        isOpen={isOpen}
        onClose={onClose}
      >
        <div className="">
          <ul className="border rounded-md flex flex-col gap-3 mb-2">
            {Array.from(files).map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => setFiles(null)}
            >
              Скасувати
            </Button>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={handleUpload}
            >
              Завантажити
            </Button>
          </div>
        </div>
      </Modal>
    );

  return (
    <Modal
      title="Завантаження зображень"
      description="Завантажте зображення тут."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div
        className="border rounded-md flex flex-col items-center justify-center h-44"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <h3>Перетягніть зображення для завантаження</h3>
        <h3>чи</h3>
        <input
          type="file"
          multiple={multipe}
          onChange={(event) => setFiles(event.target.files)}
          hidden
          accept="image/*"
          ref={inputRef}
        />
        <Button onClick={() => inputRef.current?.click()}>
          Виберіть зображення
        </Button>
      </div>
    </Modal>
  );
};

export default DragDropFiles;
