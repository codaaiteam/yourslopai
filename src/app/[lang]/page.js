import Home from '../page'

export default function Page({ params }) {
  return <Home params={params} />
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
    { lang: 'ja' },
    { lang: 'ko' },
    { lang: 'es' },
    { lang: 'fr' },
    { lang: 'de' },
  ]
}
