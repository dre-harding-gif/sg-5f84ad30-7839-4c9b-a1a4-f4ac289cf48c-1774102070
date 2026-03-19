import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface MapLauncherProps {
  address: string;
  size?: "sm" | "default" | "lg";
}

export function MapLauncher({ address, size = "default" }: MapLauncherProps) {
  const handleOpenMaps = () => {
    // Encode address for URL
    const encodedAddress = encodeURIComponent(address);
    
    // Detect device/browser
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    
    let mapsUrl: string;
    
    if (isIOS) {
      // Open Apple Maps on iOS devices
      mapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
    } else if (isAndroid) {
      // Open Google Maps on Android devices
      mapsUrl = `google.navigation:q=${encodedAddress}`;
    } else {
      // Open Google Maps in browser for desktop
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }
    
    window.open(mapsUrl, '_blank');
  };

  return (
    <Button onClick={handleOpenMaps} variant="outline" size={size}>
      <MapPin className="w-4 h-4 mr-2" />
      Open in Maps
    </Button>
  );
}