import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DocuVerse SaaS - Beautiful Documentation Platform',
  description: 'The most beautiful, fastest, and developer-friendly multi-tenant SaaS documentation platform',
  keywords: ['documentation', 'saas', 'multi-tenant', 'docs', 'developer tools'],
  authors: [{ name: 'DocuVerse' }],
  openGraph: {
    type: 'website',
    title: 'DocuVerse SaaS',
    description: 'Beautiful documentation platform for modern teams',
    siteName: 'DocuVerse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocuVerse SaaS',
    description: 'Beautiful documentation platform for modern teams',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
