"use client"
import './globals.css';
import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const inter = Inter({ subsets: ['latin'] });

// Create a client instance to avoid recreating it on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>

        <QueryClientProvider client={queryClient}>
          <main className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
            {children}
          </main>
        </QueryClientProvider>
      </body>
    </html>
  );
}
