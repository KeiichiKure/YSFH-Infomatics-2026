import type { Metadata } from 'next';
import Teaser from './Teaser';
import './teaser.css';
export const metadata: Metadata = {
  title: 'こちら、電脳ワークス！ | 漫画化決定 特報',
  description: 'こちら、電脳ワークス！ Vol.1「放課後、フリーズ」漫画化告知映像',
  robots: { index: false, follow: false },
};
export default function Page() { return <Teaser />; }
