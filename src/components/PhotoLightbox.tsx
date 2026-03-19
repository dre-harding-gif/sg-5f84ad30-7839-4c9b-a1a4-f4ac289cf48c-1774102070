import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  photo_url: string;
  caption?: string;
  photo_type?: string;
  created_at?: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  canDelete?: boolean;
  onPhotoDeleted?: () => void;
}

export function PhotoLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
  canDelete = false,
  onPhotoDeleted
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleDelete = async () => {
    if (!canDelete || !photos[currentIndex]) return;

    const photo = photos[currentIndex];
    
    try {
      const { error } = await supabase
        .from("job_photos")
        .delete()
        .eq("id", photo.id);

      if (error) throw error;

      toast({
        title: "Photo Deleted",
        description: "The photo has been removed from the job."
      });

      if (onPhotoDeleted) {
        onPhotoDeleted();
      }

      if (photos.length === 1) {
        onClose();
      } else {
        setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : 0);
      }
    } catch (error: any) {
      console.error("Delete photo error:", error);
      toast({
        title: "Error",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Delete Button */}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="absolute top-4 right-16 z-50 text-red-500 hover:bg-red-500/20"
            >
              <Trash2 className="w-6 h-6" />
            </Button>
          )}

          {/* Previous Button */}
          {photos.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 z-50 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {/* Next Button */}
          {photos.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 z-50 text-white hover:bg-white/20"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Image */}
          <div className="w-full h-full flex items-center justify-center p-12">
            <img
              src={currentPhoto.photo_url}
              alt={currentPhoto.caption || `Photo ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Caption and Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            <div className="max-w-4xl mx-auto">
              {currentPhoto.caption && (
                <p className="text-lg mb-2">{currentPhoto.caption}</p>
              )}
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>
                  {currentIndex + 1} / {photos.length}
                </span>
                {currentPhoto.photo_type && (
                  <span className="capitalize">{currentPhoto.photo_type.replace('_', ' ')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}