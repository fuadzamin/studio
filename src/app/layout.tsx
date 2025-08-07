
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { ProductProvider } from '@/contexts/ProductContext';
import { MaterialProvider } from '@/contexts/MaterialContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { EmployeeProvider } from '@/contexts/EmployeeContext';

export const metadata: Metadata = {
  title: 'ProFlow ERP',
  description: 'A comprehensive ERP solution for manufacturers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <EmployeeProvider>
            <ProductProvider>
            <MaterialProvider>
                <CustomerProvider>
                <AppShell>{children}</AppShell>
                </CustomerProvider>
            </MaterialProvider>
            </ProductProvider>
        </EmployeeProvider>
        <Toaster />
      </body>
    </html>
  );
}
