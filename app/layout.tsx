import type { Metadata } from 'next';
import './globals.css';

const title = '理数情報ラボ｜触ってわかる情報Ⅰ';
const description = 'アナログとデジタル、進数、文字コードを体験的に学ぶ高校生向けウェブ教材';
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const socialImage = `${siteUrl}/og.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: socialImage, width: 1200, height: 630, alt: '理数情報ラボ―アナログ信号からビット列へ' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [socialImage] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

