import "./globals.css";
import { Inter } from "next/font/google";
<<<<<<< HEAD
import Providers from "@/components/Providers";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Football App",
  description: "Team manager & match tracker",
};
=======
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { clearLegacyStorage, warnAgainstLocalStorage } from "@/lib/clearStorage";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // Data is fresh for 30 seconds
      gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnReconnect: true, // Refetch when reconnecting
      retry: 2,
      refetchInterval: 1000 * 60, // Auto-refetch every minute
    },
    mutations: {
      retry: 1,
    },
  },
});
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
=======
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // Clear any legacy localStorage on app start and set up warnings
  useEffect(() => {
    clearLegacyStorage();
    warnAgainstLocalStorage();
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500); // simulate loading for 500ms
    return () => clearTimeout(timeout);
  }, [pathname]);

>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
