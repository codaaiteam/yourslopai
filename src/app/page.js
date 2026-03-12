import styles from './page.module.css';
import Header from './Components/Header';
import Footer from './Components/Footer';
import QuestionFAQ from './Components/QuestionFAQ';
import GameMain from './Components/Game/GameMain';
import MoreGames from './Components/MoreGames';
import AdSense from './Components/AdSense';
import AdsterraNativeBanner from './Components/AdsterraNativeBanner';
import AdsterraBanner300x250 from './Components/AdsterraBanner300x250';
import GameWithSidebarAds from './Components/GameWithSidebarAds';
import EmbedDetect from './Components/EmbedDetect';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';

export default async function Home({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;

  return (
    <>
      <AdSense />
      <EmbedDetect />
      <Header />
      <main className={styles.mainContent}>
        {/* Game Section — first for iframe/embed visibility */}
        <section id="game" className={styles.gameSection}>
          <GameWithSidebarAds>
            <div className={styles.gameWrapper}>
              <GameMain t={t} />
            </div>
          </GameWithSidebarAds>
        </section>

        {/* More Games */}
        <MoreGames current="main" />

        {/* Adsterra Native Banner */}
        <AdsterraNativeBanner />

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>{t.hero.title}</h1>
            <p className={styles.heroSubtitle}>{t.hero.subtitle}</p>
          </div>
        </section>

        {/* Adsterra Banner 300x250 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <AdsterraBanner300x250 />
        </div>

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

        {/* Adsterra Banner 300x250 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <AdsterraBanner300x250 />
        </div>

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
