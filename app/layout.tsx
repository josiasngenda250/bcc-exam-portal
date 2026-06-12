import type { Metadata } from 'next';
import './globals.css';
import { LangProvider } from '@/components/LangProvider';

export const metadata: Metadata = {
  title: 'BCC Exam Portal — Bible Communication Center',
  description: 'Bible Communication Center — Online Exam Portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
