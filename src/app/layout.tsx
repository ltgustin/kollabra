import type { Metadata } from "next";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import './globals.css';

export const metadata: Metadata = {
  title: "Kollabra",
  description: "Description for Kollabra App!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  "use server"; 
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
