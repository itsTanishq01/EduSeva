import { useState, useRef } from "react";
import { Upload, FileText, X, Check, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { uploadDocument } from "@/services/api";
import { cache } from "@/lib/cache";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
}

export const PDFUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = async (fileList: File[]) => {
    if (fileList.length === 0) {
      toast.error("Please select PDF files only");
      return;
    }

    for (const file of fileList) {
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: "uploading",
        progress: 0,
      };

      setFiles((prev) => [...prev, uploadedFile]);

      try {
        // Update progress during upload
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          );
        }, 300);

        const response = await uploadDocument(file);

        clearInterval(progressInterval);

        // Clear all caches when a new document is uploaded
        cache.clear();

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: "completed", progress: 100 }
              : f
          )
        );

        toast.success(response.message);
        
        // Navigate to chat page after successful upload
        setTimeout(() => {
          navigate("/chat");
        }, 1000);
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, status: "error", progress: 0 } : f
          )
        );
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="h-full space-y-6 p-6 pt-20">
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] space-y-6 animate-fade-in">
          <div className="text-center space-y-4 relative">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl animate-pulse" />
              <Bot className="h-20 w-20 mx-auto text-primary relative z-10" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to EduMate
            </h2>
            <p className="text-muted-foreground max-w-md text-lg">
              Your AI study assistant. Get started by uploading a PDF or asking a question.
            </p>
          </div>
          <Button
            size="lg"
            variant="gradient"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 hover:scale-105 transition-transform duration-300"
          >
            <Upload className="h-5 w-5" />
            Upload PDF
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Upload PDFs</h2>
            <p className="text-sm text-muted-foreground">
              Upload your study materials to get started
            </p>
          </div>

          <Card
            className={`relative cursor-pointer border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10 scale-[1.02] shadow-xl"
                : "border-border hover:border-primary/50 hover:shadow-lg"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-6 transition-transform duration-300 hover:scale-110">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Drop your PDFs here
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                or click to browse files
              </p>
              <Button type="button" variant="gradient" className="transition-all duration-300 hover:scale-105">
                Select Files
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </Card>

          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Uploaded Files</h3>
              {files.map((file) => (
                <Card key={file.id} className="p-4 animate-scale-in transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                      <FileText className="h-8 w-8 text-primary" />
                      {file.status === "uploading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <p className="truncate text-sm font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                          {file.status === "uploading" && " • Uploading..."}
                          {file.status === "processing" && " • Processing..."}
                          {file.status === "completed" && " • Complete"}
                        </p>
                      </div>
                      {file.status !== "completed" && (
                        <Progress value={file.progress} className="h-1.5" />
                      )}
                    </div>
                    {file.status === "completed" && (
                      <Check className="h-5 w-5 shrink-0 text-green-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
