import Image from 'next/image';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import MoreGames from '../../Components/MoreGames';
import QuestionFAQ from '../../Components/QuestionFAQ';
import AdSense from '../../Components/AdSense';
import AdsterraNativeBanner from '../../Components/AdsterraNativeBanner';
import AdsterraBanner300x250 from '../../Components/AdsterraBanner300x250';
import GameWithSidebarAds from '../../Components/GameWithSidebarAds';
import EmbedDetect from '../../Components/EmbedDetect';
import AiRoastGame from './AiRoastGame';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import gp from '../gamePage.module.css';

export default async function AiRoastPage({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const g = t.aiRoast || {};

  return (
    <>
      <AdSense />
      <EmbedDetect />
      <Header />
      <main className={gp.pageWrapper}>
        {/* Game — first for iframe visibility */}
        <section className={gp.gameSection}>
          <GameWithSidebarAds>
            <AiRoastGame />
          </GameWithSidebarAds>
        </section>

        {/* Hero */}
        <section className={gp.hero}>
          <div className={gp.heroInner}>
            <Image src="/logo-ai-roast.png" alt="AI Roast Me" width={80} height={80} className={gp.heroLogo} />
            <h1 className={gp.heroTitle}>{g.hero?.title || 'AI Roast Me'}</h1>
            <p className={gp.heroSubtitle}>{g.hero?.subtitle || 'Describe yourself and let AI roast you.'}</p>
          </div>
        </section>

        {/* Adsterra Banner 300x250 - between Hero and MoreGames */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <AdsterraBanner300x250 />
        </div>

        {/* More Games */}
        <MoreGames current="ai-roast" />

        <AdsterraNativeBanner />

        {/* What Is */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.about?.sectionTitle || 'What Is AI Roast Me?'}</h2>
            <div className={gp.aboutContent}>
              <p>{g.about?.p1}</p>
              <p>{g.about?.p2}</p>
              <p>{g.about?.p3}</p>
            </div>
          </div>
        </section>

        {/* How to Play */}
        <section className={gp.howtoSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.howToPlay?.sectionTitle || 'How to Get Roasted'}</h2>
            <div className={gp.stepsGrid}>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>1</div>
                <h3>{g.howToPlay?.step1Title || 'Describe Yourself'}</h3>
                <p>{g.howToPlay?.step1Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>2</div>
                <h3>{g.howToPlay?.step2Title || 'Hit "Roast Me"'}</h3>
                <p>{g.howToPlay?.step2Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>3</div>
                <h3>{g.howToPlay?.step3Title || 'Laugh (or Cry)'}</h3>
                <p>{g.howToPlay?.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className={gp.whySection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.why?.sectionTitle || 'Why AI Roast Me Is So Addictive'}</h2>
            <div className={gp.whyContent}>
              <p>{g.why?.p1}</p>
              <p>{g.why?.p2}</p>
              <p>{g.why?.p3}</p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={gp.howtoSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.tips?.sectionTitle || 'Pro Tips for Better Roasts'}</h2>
            <div className={gp.featuresGrid}>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🎯</span>
                <h3>{g.tips?.tip1Title || 'Be Specific'}</h3>
                <p>{g.tips?.tip1Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>😂</span>
                <h3>{g.tips?.tip2Title || 'Lean Into It'}</h3>
                <p>{g.tips?.tip2Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🌍</span>
                <h3>{g.tips?.tip3Title || 'Any Language'}</h3>
                <p>{g.tips?.tip3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <AdsterraBanner300x250 />
        </div>

        {/* FAQ */}
        <section className={gp.faqSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.faq?.sectionTitle || 'Frequently Asked Questions'}</h2>
            <div className={gp.faqList}>
              <QuestionFAQ question={g.faq?.q1} answer={g.faq?.a1} />
              <QuestionFAQ question={g.faq?.q2} answer={g.faq?.a2} />
              <QuestionFAQ question={g.faq?.q3} answer={g.faq?.a3} />
              <QuestionFAQ question={g.faq?.q4} answer={g.faq?.a4} />
              <QuestionFAQ question={g.faq?.q5} answer={g.faq?.a5} />
              <QuestionFAQ question={g.faq?.q6} answer={g.faq?.a6} />
            </div>
          </div>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}
