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
import AiOrHumanGame from './AiOrHumanGame';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import gp from '../gamePage.module.css';

export default async function AiOrHumanPage({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const g = t.aiOrHuman || {};

  return (
    <>
      <AdSense />
      <EmbedDetect />
      <Header />
      <main className={gp.pageWrapper}>
        {/* Game — first for iframe visibility */}
        <section className={gp.gameSection}>
          <GameWithSidebarAds>
            <AiOrHumanGame />
          </GameWithSidebarAds>
        </section>

        {/* Hero */}
        <section className={gp.hero}>
          <div className={gp.heroInner}>
            <Image src="/logo-ai-or-human.png" alt="AI or Human?" width={80} height={80} className={gp.heroLogo} />
            <h1 className={gp.heroTitle}>{g.hero?.title || 'AI or Human?'}</h1>
            <p className={gp.heroSubtitle}>{g.hero?.subtitle || 'Can you tell who wrote it? You have 2 seconds per round!'}</p>
          </div>
        </section>

        {/* More Games */}
        <MoreGames current="ai-or-human" />

        <AdsterraNativeBanner />

        {/* What Is */}
        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.about?.sectionTitle || 'What Is AI or Human?'}</h2>
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
            <h2 className={gp.sectionTitle}>{g.howToPlay?.sectionTitle || 'How to Play'}</h2>
            <div className={gp.stepsGrid}>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>1</div>
                <h3>{g.howToPlay?.step1Title || 'Read the Text'}</h3>
                <p>{g.howToPlay?.step1Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>2</div>
                <h3>{g.howToPlay?.step2Title || 'Make Your Guess'}</h3>
                <p>{g.howToPlay?.step2Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>3</div>
                <h3>{g.howToPlay?.step3Title || 'See the Result'}</h3>
                <p>{g.howToPlay?.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className={gp.whySection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{g.why?.sectionTitle || 'Why Play AI or Human?'}</h2>
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
            <h2 className={gp.sectionTitle}>{g.tips?.sectionTitle || 'Spotting the Difference'}</h2>
            <div className={gp.featuresGrid}>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🔍</span>
                <h3>{g.tips?.tip1Title || 'Watch for Perfection'}</h3>
                <p>{g.tips?.tip1Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>💬</span>
                <h3>{g.tips?.tip2Title || 'Check the Emotion'}</h3>
                <p>{g.tips?.tip2Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🎯</span>
                <h3>{g.tips?.tip3Title || 'Notice the Structure'}</h3>
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
