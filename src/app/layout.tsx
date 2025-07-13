import { Outfit } from 'next/font/google';
import './globals.css';
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      elements: {
        footerAction: { display: 'none'},
        footerAction__signUp: { display: 'none'},
        footer: {display: "none"}
      }
    }}>
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
