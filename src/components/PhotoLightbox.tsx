import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (photoId: string) => void;
  canDelete?: boolean;
}

export function PhotoLightbox({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  onDelete,
  canDelete = false,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync state if initialIndex changes when reopened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : prev));
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose, photos?.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === photos.length - 1;

  const goToPrevious = () => {
    if (!isFirst) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (!isLast) setCurrentIndex(currentIndex + 1);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentPhoto.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `job-photo-${currentPhoto.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading photo:", error);
    }
  };

  const handleDelete = () => {
    if (onDelete && currentPhoto.id) {
      if (confirm("Are you sure you want to delete this photo?")) {
        onDelete(currentPhoto.id);
        if (photos.length > 1) {
          setCurrentIndex(isLast ? currentIndex - 1 : currentIndex);
        } else {
          onClose();
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Navigation Buttons */}
      {!isFirst && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
          onClick={goToPrevious}
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
      )}

      {!isLast && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
          onClick={goToNext}
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      )}

      {/* Main Image */}
      <div className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
        <img
          src={currentPhoto.url}
          alt={currentPhoto.caption || `Photo ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            {currentPhoto.caption && (
              <p className="text-white text-lg font-medium">{currentPhoto.caption}</p>
            )}
            {currentPhoto.uploadedBy && (
              <p className="text-white/60 text-sm">
                Uploaded by {currentPhoto.uploadedBy}
                {currentPhoto.uploadedAt && ` • ${new Date(currentPhoto.uploadedAt).toLocaleDateString()}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm mr-4">
              {currentIndex + 1} / {photos.length}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5" />
            </Button>

            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-400 hover:bg-red-400/10"
                onClick={handleDelete}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}