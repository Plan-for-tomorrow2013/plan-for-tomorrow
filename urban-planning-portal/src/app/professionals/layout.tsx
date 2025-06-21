'use client';

import { Inter } from 'next/font/google';
import '@shared/styles/globals.css';
import { Toaster } from '@shared/components/ui/toaster';
import { Navigation } from '../../../../shared/components/Navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/professionals/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className={inter.className}>
      <div className="flex min-h-screen">
        <Navigation role="professional" className="w-64 border-r" />
        <main className="flex-1">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
