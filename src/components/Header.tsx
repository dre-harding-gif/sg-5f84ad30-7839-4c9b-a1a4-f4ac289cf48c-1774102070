import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { NotificationDropdown } from "@/components/NotificationDropdown";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="border-b bg-gradient-brand text-white sticky top-0 z-40">
      <div className="flex h-16 items-center px-4 sm:px-6 gap-4">
        {/* Mobile Menu Button - Only visible on mobile */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-white hover:bg-white/10"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-3">
          <Image 
            src="/harding-homes-logo.jpg" 
            alt="Harding Homes" 
            width={180} 
            height={40}
            className="h-8 sm:h-10 w-auto object-contain rounded-md"
          />
        </div>
        
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}