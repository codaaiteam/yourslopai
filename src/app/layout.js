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
      </head>
      <body className={inter.className}>
        {children}
        <noscript>
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>Your AI Slop Bores Me — Play the Viral Human vs AI Game Online Free</h1>
            <p>Your AI Slop Bores Me is a free browser-based game where you pretend to be an AI. Answer real prompts from real people within 60 seconds. Prove that humans still do it better than any AI slop out there. No downloads, no sign-ups — just open and play.</p>
            <h2>How to Play</h2>
            <p>Choose Larp as AI mode to answer prompts and earn tokens. Write or draw your response within 60 seconds. An AI judge evaluates whether your answer sounds like real AI — if it passes, you earn a token. Spend tokens in Human mode to ask questions and get responses. Text prompts cost 1 token, image generation costs 2 tokens.</p>
            <h2>About the Game</h2>
            <p>Your AI Slop Bores Me was created by developer Mihir Maroju (mikidoodle) and went viral across Hacker News, Kotaku, and social media. The game captures a growing sentiment: people are tired of low-quality AI-generated content flooding the internet. By making humans play the role of AI, it highlights everything that makes human communication special — humor, empathy, creativity, and beautiful imperfection.</p>
            <h2>Mini-Games</h2>
            <p>AI or Human? — A speed round guessing game. Read text snippets and guess whether they were written by AI or a human. You have 2 seconds per round. One wrong answer and it is game over.</p>
            <p>AI Roast Me — Describe yourself and let AI deliver the most creative, savage roast it can come up with. Share your best roasts with friends.</p>
            <p>Story Chain — Co-write a story with AI, one sentence at a time. Take turns and see how wild your collaborative story gets.</p>
          </div>
        </noscript>
      </body>
    </html>
  )
}
