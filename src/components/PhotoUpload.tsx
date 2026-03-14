import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Check, Clock } from "lucide-react";
import { offlineStorage } from "@/lib/offline";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface PhotoUploadProps {
  jobId: string;
  onPhotoAdded?: () => void;
}

export function PhotoUpload({ jobId, onPhotoAdded }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Array<{ id: number; file: File; caption: string; synced: boolean }>>([]);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOnline = useOnlineStatus();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Add to IndexedDB for offline support
    const photoId = await offlineStorage.addPhoto(jobId, file, caption);
    
    setPhotos([...photos, { id: photoId, file, caption, synced: false }]);
    setCaption("");
    
    // If online, trigger sync immediately
    if (isOnline && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-photos');
      }
    }
    
    onPhotoAdded?.();
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePhoto = (photoId: number) => {
    setPhotos(photos.filter(p => p.id !== photoId));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="photo-caption">Photo Caption (Optional)</Label>
        <Input
          id="photo-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g., Kitchen extension - before work"
        />
      </div>

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button onClick={handleCameraCapture} className="flex-1">
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Photo
        </Button>
      </div>

      {photos.length > 0 && (
        <div className="space-y-2">
          <Label>Photos to Upload</Label>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo) => (
              <Card key={photo.id}>
                <CardContent className="p-3">
                  <div className="aspect-video bg-gray-100 rounded-lg mb-2 relative overflow-hidden">
                    <img
                      src={URL.createObjectURL(photo.file)}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    
                    <div className="absolute bottom-1 right-1">
                      {photo.synced ? (
                        <div className="bg-green-500 text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className="bg-orange-500 text-white rounded-full p-1">
                          <Clock className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                  {photo.caption && (
                    <p className="text-xs text-muted-foreground truncate">{photo.caption}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isOnline && photos.some(p => !p.synced) && (
        <p className="text-sm text-orange-600 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Photos will upload when you're back online
        </p>
      )}
    </div>
  );
}