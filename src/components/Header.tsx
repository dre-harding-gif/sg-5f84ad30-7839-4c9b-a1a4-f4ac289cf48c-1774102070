import Link from "next/link";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/NotificationDropdown";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-brand text-white shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="bg-black/20 p-1.5 rounded-lg">
            <Image 
              src="/harding-homes-logo.jpg" 
              alt="Harding Homes" 
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
            />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}