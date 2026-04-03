import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/NotificationDropdown";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-brand text-white shadow-lg lg:hidden">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-white hover:bg-white/20"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-black/20 p-1.5 rounded-lg">
              <Image 
                src="/harding-homes-logo.jpg" 
                alt="Harding Homes" 
                width={140}
                height={42}
                className="h-9 w-auto object-contain"
              />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}