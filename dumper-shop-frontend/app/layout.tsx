'use client';

import '@mantine/core/styles.css';

import React from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { ActionIcon, ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Footer } from '../components/Footer/Footer';
import { Header } from '../components/Header/Header';
import { theme } from '../theme';

export default function RootLayout({ children }: { children: any }) {
  const handleWhatsAppClick = () => {
    const phoneNumber = '237XXXXXXXXX'; // Replace with actual WhatsApp business number
    const message = encodeURIComponent('Hello! I need help with my order from DumperShop.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <style>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
          .whatsapp-bounce {
            animation: bounce 2s infinite;
          }
        `}</style>
      </head>
      <body>
        <MantineProvider theme={theme}>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main style={{ flex: 1, minHeight: 'calc(100vh - 140px)' }}>{children}</main>
            <Footer />
          </div>

          {/* WhatsApp Floating Button */}
          <ActionIcon
            size="xl"
            radius="xl"
            color="green"
            variant="filled"
            className="whatsapp-bounce"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
            onClick={handleWhatsAppClick}
          >
            <IconBrandWhatsapp size={28} />
          </ActionIcon>
        </MantineProvider>
      </body>
    </html>
  );
}
