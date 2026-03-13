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
import GuessPromptGame from './GuessPromptGame';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import gp from '../gamePage.module.css';

const FALLBACK = {
  seoTitle: 'Guess the Prompt – See the Drawing, Guess What They Were Drawing',
  seoDescription: 'See a human drawing and guess which prompt they were trying to draw. Pick the right prompt from 4 choices. Play free online!',
  hero: {
    title: 'Guess the Prompt',
    subtitle: 'See a human drawing and guess which prompt they were trying to draw!',
  },
  about: {
    sectionTitle: 'What Is Guess the Prompt?',
    p1: 'Guess the Prompt is a visual guessing game where you see a drawing made by a real human player and try to figure out which prompt they were given to draw.',
    p2: 'Each round consists of 10 questions with 4 choices each. Get all 10 right to level up! Higher levels add a countdown timer that gets shorter.',
    p3: 'All drawings come from real players of Your AI Slop Bores Me, making every round unique, hilarious, and unpredictable.',
  },
  howToPlay: {
    sectionTitle: 'How to Play',
    step1Title: 'Look at the Drawing',
    step1Desc: 'Each round shows you a hand-drawn image from a real player in the community.',
    step2Title: 'Pick the Prompt',
    step2Desc: 'Read the 4 options and choose which prompt you think the player was trying to draw.',
    step3Title: 'Level Up',
    step3Desc: 'Get all 10 right to advance. Higher levels bring shorter timers!',
  },
  tips: {
    sectionTitle: 'Tips for Guessing',
    tip1Title: 'Look for Details',
    tip1Desc: 'Even in messy drawings, specific shapes or objects often hint at the correct prompt.',
    tip2Title: 'Think Like the Artist',
    tip2Desc: 'What would YOU draw if given this prompt? Match the drawing to the most logical choice.',
    tip3Title: 'Eliminate Options',
    tip3Desc: "If you're unsure, rule out prompts that clearly don't match what you see.",
  },
  faq: {
    sectionTitle: 'Frequently Asked Questions',
    q1: 'Where do the drawings come from?',
    a1: "All drawings are made by real human players in 'Your AI Slop Bores Me' — they had 60 seconds to draw their answer to a prompt.",
    q2: 'How many rounds can I play?',
    a2: 'Each level has 10 rounds. Get all 10 correct to advance to the next level with a harder timer.',
    q3: 'Is this free to play?',
    a3: 'Yes, completely free. No sign-up required.',
    q4: 'Can I submit my own drawings?',
    a4: "Yes! Play the main game 'Your AI Slop Bores Me' and your drawings may appear in Guess the Prompt rounds.",
  },
};

export default async function GuessPromptPage({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const gp_t = t?.guessPrompt || {};

  return (
    <>
      <AdSense />
      <EmbedDetect />
      <Header />
      <main className={gp.pageWrapper}>
        <section className={gp.gameSection}>
          <GameWithSidebarAds>
            <GuessPromptGame />
          </GameWithSidebarAds>
        </section>

        <MoreGames current="guess-prompt" />

        <AdsterraNativeBanner />

        <section className={gp.hero}>
          <div className={gp.heroInner}>
            <Image src="/logo-guess-prompt.png" alt={gp_t.hero?.title || FALLBACK.hero.title} width={80} height={80} className={gp.heroLogo} />
            <h1 className={gp.heroTitle}>{gp_t.hero?.title || FALLBACK.hero.title}</h1>
            <p className={gp.heroSubtitle}>{gp_t.hero?.subtitle || FALLBACK.hero.subtitle}</p>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <AdsterraBanner300x250 />
        </div>

        <section className={gp.aboutSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{gp_t.about?.sectionTitle || FALLBACK.about.sectionTitle}</h2>
            <div className={gp.aboutContent}>
              <p>{gp_t.about?.p1 || FALLBACK.about.p1}</p>
              <p>{gp_t.about?.p2 || FALLBACK.about.p2}</p>
              <p>{gp_t.about?.p3 || FALLBACK.about.p3}</p>
            </div>
          </div>
        </section>

        <section className={gp.howtoSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{gp_t.howToPlay?.sectionTitle || FALLBACK.howToPlay.sectionTitle}</h2>
            <div className={gp.stepsGrid}>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>1</div>
                <h3>{gp_t.howToPlay?.step1Title || FALLBACK.howToPlay.step1Title}</h3>
                <p>{gp_t.howToPlay?.step1Desc || FALLBACK.howToPlay.step1Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>2</div>
                <h3>{gp_t.howToPlay?.step2Title || FALLBACK.howToPlay.step2Title}</h3>
                <p>{gp_t.howToPlay?.step2Desc || FALLBACK.howToPlay.step2Desc}</p>
              </div>
              <div className={gp.stepCard}>
                <div className={gp.stepNumber}>3</div>
                <h3>{gp_t.howToPlay?.step3Title || FALLBACK.howToPlay.step3Title}</h3>
                <p>{gp_t.howToPlay?.step3Desc || FALLBACK.howToPlay.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={gp.howtoSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{gp_t.tips?.sectionTitle || FALLBACK.tips.sectionTitle}</h2>
            <div className={gp.featuresGrid}>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🔍</span>
                <h3>{gp_t.tips?.tip1Title || FALLBACK.tips.tip1Title}</h3>
                <p>{gp_t.tips?.tip1Desc || FALLBACK.tips.tip1Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🎨</span>
                <h3>{gp_t.tips?.tip2Title || FALLBACK.tips.tip2Title}</h3>
                <p>{gp_t.tips?.tip2Desc || FALLBACK.tips.tip2Desc}</p>
              </div>
              <div className={gp.featureCard}>
                <span className={gp.featureIcon}>🎯</span>
                <h3>{gp_t.tips?.tip3Title || FALLBACK.tips.tip3Title}</h3>
                <p>{gp_t.tips?.tip3Desc || FALLBACK.tips.tip3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <AdsterraBanner300x250 />
        </div>

        <section className={gp.faqSection}>
          <div className={gp.container}>
            <h2 className={gp.sectionTitle}>{gp_t.faq?.sectionTitle || FALLBACK.faq.sectionTitle}</h2>
            <div className={gp.faqList}>
              <QuestionFAQ question={gp_t.faq?.q1 || FALLBACK.faq.q1} answer={gp_t.faq?.a1 || FALLBACK.faq.a1} />
              <QuestionFAQ question={gp_t.faq?.q2 || FALLBACK.faq.q2} answer={gp_t.faq?.a2 || FALLBACK.faq.a2} />
              <QuestionFAQ question={gp_t.faq?.q3 || FALLBACK.faq.q3} answer={gp_t.faq?.a3 || FALLBACK.faq.a3} />
              <QuestionFAQ question={gp_t.faq?.q4 || FALLBACK.faq.q4} answer={gp_t.faq?.a4 || FALLBACK.faq.a4} />
            </div>
          </div>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}
