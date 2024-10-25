import type { Metadata } from "next";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserProfileProvider } from '@/hooks/UserProfileContext';


import '../styles/app.scss';

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
          <UserProfileProvider>
            <Header />
            {children}
            <Footer />
          </UserProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
