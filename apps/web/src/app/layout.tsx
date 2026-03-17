import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StoryAI - Transform Scripts to Storyboards',
  description:
    'AI-powered storyboard and concept art generation for creators, filmmakers, and storytellers.',
  keywords: ['storyboard', 'AI', 'concept art', 'filmmaking', 'creative'],
  authors: [{ name: 'StoryAI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
