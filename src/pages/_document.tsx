import { Html, Head, Main, NextScript } from "next/document";
import { SEOElements } from "@/components/SEO";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <SEOElements />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
        <meta name="msapplication-navbutton-color" content="#1e3a8a" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Favicons - Updated to use new logo */}
        <link rel="icon" type="image/jpeg" href="/harding-homes-logo.jpg" />
        <link rel="shortcut icon" href="/harding-homes-logo.jpg" />
        
        {/* Apple Touch Icons - Will be updated with proper PNG icons */}
        <link rel="apple-touch-icon" href="/harding-homes-logo.jpg" />
        
        {/* Apple Web App */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Harding Homes" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
