import '../globals.css'
import { Inter } from 'next/font/google'
import { getTranslation } from '@/lib/i18n'

const inter = Inter({ subsets: ['latin'] })
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://youraislopboresmegame.com'

export async function generateMetadata({ params }) {
  const locale = params?.lang || 'en'
  const t = await getTranslation(locale)
  const currentUrl = `${BASE_URL}/${locale}`

  return {
    metadataBase: new URL(BASE_URL),
    title: t.seoTitle,
    description: t.seoDescription,
    keywords: t.keywords,
    openGraph: {
      title: t.meta.ogTitle || t.seoTitle,
      description: t.meta.ogDescription || t.seoDescription,
      type: 'website',
      url: currentUrl,
      images: [{ url: t.meta.ogImage }],
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.twitterTitle || t.seoTitle,
      description: t.meta.twitterDescription || t.seoDescription,
      images: [t.meta.twitterImage],
    },
    alternates: {
      canonical: currentUrl,
      languages: {
        'en': `${BASE_URL}/en`,
        'zh': `${BASE_URL}/zh`,
        'ja': `${BASE_URL}/ja`,
        'ko': `${BASE_URL}/ko`,
        'es': `${BASE_URL}/es`,
      }
    }
  }
}

export default async function Layout({ children, params }) {
  const locale = params?.lang || 'en'

  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
