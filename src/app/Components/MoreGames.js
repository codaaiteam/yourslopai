'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';
import styles from './MoreGames.module.css';

const ALL_GAMES = [
  { slug: 'main', path: '/#game', logo: '/logo-site.png', titleKey: 'mainTitle', descKey: 'mainDesc' },
  { slug: 'ai-or-human', path: '/games/ai-or-human', logo: '/logo-ai-or-human.png', titleKey: 'aiOrHumanTitle', descKey: 'aiOrHumanDesc' },
  { slug: 'ai-roast', path: '/games/ai-roast', logo: '/logo-ai-roast.png', titleKey: 'aiRoastTitle', descKey: 'aiRoastDesc' },
  { slug: 'story-chain', path: '/games/story-chain', logo: '/logo-story-chain.png', titleKey: 'storyChainTitle', descKey: 'storyChainDesc' },
  { slug: 'ai-banana', path: 'https://aibanana.net/', logo: '/logo-ai-banana.png', titleKey: 'aiBananaTitle', descKey: 'aiBananaDesc', external: true },
];

const FALLBACK = {
  title: 'More Games',
  subtitle: 'Try other AI mini-games on the site.',
  mainTitle: 'Your AI Slop Bores Me',
  mainDesc: 'The original game — larp as AI, fool the judges, earn tokens.',
  aiOrHumanTitle: 'AI or Human?',
  aiOrHumanDesc: 'Read a snippet and guess — was it written by AI or a real person?',
  aiRoastTitle: 'AI Roast Me',
  aiRoastDesc: 'Describe yourself and let AI deliver the most creative roast.',
  storyChainTitle: 'Story Chain',
  storyChainDesc: 'Co-write a story with AI, one sentence at a time.',
  aiBananaTitle: 'Free AI Image Generator',
  aiBananaDesc: 'Create your own meme AI images for free.',
};

export default function MoreGames({ current }) {
  const { t } = useTranslations();
  const params = useParams();
  const lang = params?.lang || '';
  const mg = t?.moreGames || {};
  const games = ALL_GAMES.filter((g) => g.slug !== current);

  const prefix = lang ? `/${lang}` : '';

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{mg.title || FALLBACK.title}</h2>
        <p className={styles.subtitle}>{mg.subtitle || FALLBACK.subtitle}</p>
        <div className={styles.grid}>
          {games.map((game) => {
            const href = game.external ? game.path : game.slug === 'main' ? `${prefix || '/'}#game` : `${prefix}${game.path}`;
            const CardTag = game.external ? 'a' : Link;
            const extraProps = game.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <CardTag key={game.slug} href={href} className={styles.card} {...extraProps}>
                <div className={styles.logoWrap}>
                  <Image
                    src={game.logo}
                    alt={mg[game.titleKey] || FALLBACK[game.titleKey]}
                    width={280}
                    height={280}
                    className={styles.logo}
                  />
                </div>
                <h3>{mg[game.titleKey] || FALLBACK[game.titleKey]}</h3>
                <p>{mg[game.descKey] || FALLBACK[game.descKey]}</p>
              </CardTag>
            );
          })}
        </div>
      </div>
    </section>
  );
}
