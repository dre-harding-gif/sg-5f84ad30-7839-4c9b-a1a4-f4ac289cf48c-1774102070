import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useEffect } from "react";

function ServiceWorkerManager() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (updateAvailable) {
      // Silently update in background, don't prompt user
      updateServiceWorker();
    }
  }, [updateAvailable, updateServiceWorker]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <ServiceWorkerManager />
      <Component {...pageProps} />
      <OfflineIndicator />
      <Toaster />
    </ThemeProvider>
  );
}
