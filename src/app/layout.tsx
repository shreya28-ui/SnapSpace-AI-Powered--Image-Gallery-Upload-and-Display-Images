
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PwaInstallPrompt } from '@/components/layout/PwaInstallPrompt';

export const metadata: Metadata = {
  title: 'SnapSpace - AI Image Gallery',
  description: 'Your professional space for organizing and managing images with AI tagging.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SnapSpace',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#52667A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/snapicon/192/192" />
      </head>
      <body className="font-body antialiased min-h-screen overscroll-none">
        <FirebaseClientProvider>
          {children}
          <PwaInstallPrompt />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
