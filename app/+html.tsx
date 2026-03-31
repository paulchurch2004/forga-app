import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS PWA — these are required for standalone mode on iPhone/iPad */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FORGA" />
        <link rel="apple-touch-icon" href="/pwa-icon.png" />

        {/* Theme color (hides browser chrome on Android) */}
        <meta name="theme-color" content="#0B0B14" />
        <meta name="msapplication-TileColor" content="#0B0B14" />
      </head>
      <body>{children}</body>
    </html>
  );
}
