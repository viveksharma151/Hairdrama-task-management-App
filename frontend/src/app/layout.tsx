import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hairdrama Tasks | Premium Task Management',
  description: 'Manage tasks efficiently with Hairdrama Task Manager. Featuring Google OAuth, assignment tracking, and email notifications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="main-layout">
          <Navbar />
          <main className="page-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
