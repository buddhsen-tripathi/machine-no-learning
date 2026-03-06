import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/hooks/use-theme";
import { Header } from "@/components/layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Machine No Learning - ML Visualizations",
  description:
    "Interactive visualizations to understand machine learning concepts intuitively",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
