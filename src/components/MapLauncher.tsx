import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

interface MapLauncherProps {
  address: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
}

export function MapLauncher({ address, variant = "outline", size = "sm", showIcon = true, className = "" }: MapLauncherProps) {
  const handleLaunch = () => {
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const encodedAddress = encodeURIComponent(address);
    
    if (isIOS) {
      window.open(`maps://?q=${encodedAddress}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLaunch} 
      className={`gap-2 ${className}`}
    >
      {showIcon && <Navigation className="w-4 h-4" />}
      Get Directions
    </Button>
  );
}