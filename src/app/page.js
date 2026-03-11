'use client'

import styles from './page.module.css';
import Header from './Components/Header';
import Footer from './Components/Footer';
import QuestionFAQ from './Components/QuestionFAQ';
import GameMain from './Components/Game/GameMain';
import MoreGames from './Components/MoreGames';
import AdSense from './Components/AdSense';
import { useTranslations } from '@/hooks/useTranslations';

export default function Home() {
  const { t, isLoading } = useTranslations();

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <>
      <AdSense />
      <Header />
      <main className={styles.mainContent}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>{t.hero.title}</h1>
            <p className={styles.heroSubtitle}>{t.hero.subtitle}</p>
            <a href="#game" className={styles.ctaBtn}>{t.hero.cta}</a>
          </div>
        </section>

        {/* Game Section */}
        <section id="game" className={styles.gameSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t.game.sectionTitle}</h2>
            <p className={styles.sectionDesc}>{t.game.desc}</p>
            <div className={styles.gameWrapper}>
              <GameMain t={t} />
            </div>
            <p className={styles.gameTip}>
              💡 Play the full game on the official site →{' '}
              <a href="https://youraislopboresmegame.com">
                youraislopboresmegame.com
              </a>
            </p>
          </div>
        </section>

        {/* More Games */}
        <MoreGames current="main" />

        {/* About */}
        <section id="about" className={styles.aboutSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t.about.sectionTitle}</h2>
            <div className={styles.aboutGrid}>
              <div className={styles.aboutText}>
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
                <p>{t.about.p3}</p>
              </div>
              <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                  <span className={styles.featureIcon}>⏱️</span>
                  <h3>{t.features.title1}</h3>
                  <p>{t.features.desc1}</p>
                </div>
                <div className={styles.featureCard}>
                  <span className={styles.featureIcon}>🪙</span>
                  <h3>{t.features.title2}</h3>
                  <p>{t.features.desc2}</p>
                </div>
                <div className={styles.featureCard}>
                  <span className={styles.featureIcon}>🌐</span>
                  <h3>{t.features.title3}</h3>
                  <p>{t.features.desc3}</p>
                </div>
                <div className={styles.featureCard}>
                  <span className={styles.featureIcon}>🎨</span>
                  <h3>{t.features.title4}</h3>
                  <p>{t.features.desc4}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Play */}
        <section id="how-to-play" className={styles.howtoSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t.howToPlay.sectionTitle}</h2>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h3>{t.howToPlay.step1Title}</h3>
                <p>{t.howToPlay.step1Desc}</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h3>{t.howToPlay.step2Title}</h3>
                <p>{t.howToPlay.step2Desc}</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h3>{t.howToPlay.step3Title}</h3>
                <p>{t.howToPlay.step3Desc}</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>4</div>
                <h3>{t.howToPlay.step4Title}</h3>
                <p>{t.howToPlay.step4Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Viral */}
        <section className={styles.whySection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t.why.sectionTitle}</h2>
            <div className={styles.whyContent}>
              <p>{t.why.p1}</p>
              <p>{t.why.p2}</p>
              <p>{t.why.p3}</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={styles.faqSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t.faq.sectionTitle}</h2>
            <div className={styles.faqList}>
              <QuestionFAQ question={t.faq.q1} answer={t.faq.a1} />
              <QuestionFAQ question={t.faq.q2} answer={t.faq.a2} />
              <QuestionFAQ question={t.faq.q3} answer={t.faq.a3} />
              <QuestionFAQ question={t.faq.q4} answer={t.faq.a4} />
              <QuestionFAQ question={t.faq.q5} answer={t.faq.a5} />
              <QuestionFAQ question={t.faq.q6} answer={t.faq.a6} />
            </div>
          </div>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}
