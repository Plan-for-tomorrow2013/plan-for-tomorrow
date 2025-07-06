'use client';

import { Inter } from 'next/font/google';
import '@shared/styles/globals.css';
import { Toaster } from '@shared/components/ui/toaster';
import { Navigation } from '@shared/components/Navigation';
import {
  FileText,
  Menu,
  FileCheck,
  BellRing,
  ClipboardCheck,
  BookOpen,
  HomeIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/admin/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <html lang="en">
      <head>{/* Add any head elements here, like title, meta tags, etc. */}</head>
      <body>
        <div className="flex min-h-screen">
          <aside className="w-64 border-r p-4">
            <div className="mb-8">
              <h1 className="text-xl font-bold">Plan For Tomorrow - Admin Portal</h1>
            </div>
            <nav>
              <ul>
                <li>
                  <Link href="/admin/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link href="/admin/pre-prepared-assessments">
                    Pre-prepared Report Writer Assessments
                  </Link>
                </li>
                <li>
                  <Link href="/admin/report-writer">Report Writer</Link>
                </li>
                <li>
                  <Link href="/admin/initial-assessment">Initial Assessment</Link>
                </li>
                <li>
                  <Link href="/admin/knowledge-base">Knowledge Base</Link>
                </li>
                <li>
                  <Link href="/admin/jobs">Jobs</Link>
                </li>
                <li>
                  <Link href="/admin/design-check">Design Check</Link>
                </li>
                <li>
                  <Link href="/admin/consultants">Consultants</Link>
                </li>
                <li>
                  <Link href="/admin/consultants-tickets">Consultant Tickets</Link>
                </li>
                <li>
                  <Link href="/admin/consultants-work-orders">Work Orders</Link>
                </li>
                <li>
                  <Link href="/admin/account">Account</Link>
                </li>
                <li>
                  <Link href="/admin/logout">Log Out</Link>
                </li>
                <li>
                  <Link href="/admin/help">Help</Link>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
