import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

interface MapLauncherProps {
  address: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
}

export function MapLauncher({ address, variant = "outline", size = "sm", showIcon = true }: MapLauncherProps) {
  const handleOpenMaps = () => {
    // Detect device and open appropriate maps app
    const encodedAddress = encodeURIComponent(address);
    
    // Check if iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Try to open Apple Maps first, fallback to Google Maps
      window.location.href = `maps://maps.apple.com/?q=${encodedAddress}`;
      
      // Fallback to Google Maps if Apple Maps doesn't open
      setTimeout(() => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
      }, 500);
    } else {
      // For Android and other devices, use Google Maps
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleOpenMaps}
      className="gap-2"
    >
      {showIcon && <Navigation className="w-4 h-4" />}
      Get Directions
    </Button>
  );
}