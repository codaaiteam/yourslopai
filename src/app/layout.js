import './globals.css'
import { Inter } from 'next/font/google'

import en from '../locales/en.json'
import zh from '../locales/zh.json'
import ja from '../locales/ja.json'
import ko from '../locales/ko.json'
import es from '../locales/es.json'

const translations = { en, zh, ja, ko, es }
const locales = Object.keys(translations)
const inter = Inter({ subsets: ['latin'] })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://youraislopboresmegame.com'

export async function generateMetadata({ params }) {
  const locale = params?.lang || 'en'
  const t = translations[locale] || translations['en']

  const currentUrl = `${BASE_URL}/${locale}`

  const languageAlternates = locales.reduce((acc, lang) => {
    acc[lang] = `${BASE_URL}/${lang}`
    return acc
  }, {})

  return {
    metadataBase: new URL(BASE_URL),
    title: t.seoTitle,
    description: t.seoDescription,
    keywords: t.keywords,
    openGraph: {
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      type: 'website',
      url: currentUrl,
      images: [{ url: t.meta.ogImage }],
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.twitterTitle,
      description: t.meta.twitterDescription,
      images: [t.meta.twitterImage],
    },
    alternates: {
      canonical: currentUrl,
      languages: languageAlternates,
    },
    robots: t.seo.robots,
  }
}

export default function RootLayout({ children, params }) {
  const locale = params?.lang || 'en'
  const t = translations[locale] || translations['en']

  return (
    <html lang={t.layout.language}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script defer data-domain="youraislopboresmegame.com" src="https://app.pageview.app/js/script.js"></script>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5451478429268021" crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
