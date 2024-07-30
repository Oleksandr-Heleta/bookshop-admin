import { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface DragDropFilesProps {
    isOpen: boolean;
  }

const DragDropFiles: React.FC<DragDropFilesProps> = ({ isOpen }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setFiles(event.dataTransfer.files);
  };

  const onClose = () => {};

  // send files to the server // 
  const handleUpload = () => {
    const formData = new FormData();
    if (files) {
      Array.from(files).forEach((file, index) => {
        formData.append(`Files[${index}]`, file);
      });
    }
    console.log(formData.getAll("Files"));
    // fetch(
    //   "link", {
    //     method: "POST",
    //     body: formData
    //   }
    // )
  };

  if (files)
    return (
      <Modal
        title="Завантаження зображень"
        description="Завантажте зображення тут."
        isOpen={isOpen}
        onClose={onClose}
      >
        <div className="uploads">
          <ul>
            {Array.from(files).map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
          <div className="actions">
            <Button variant="outline" onClick={() => setFiles(null)}>Скасувати</Button>
            <Button variant="destructive"  onClick={handleUpload}>Завантажити</Button>
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
      <div className="border rounded-md flex flex-col items-center justify-center h-44" onDragOver={handleDragOver} onDrop={handleDrop}>
        <h3>Перетягніть зображення для завантаження</h3>
        <h3>чи</h3>
        <input
          type="file"
          multiple
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
