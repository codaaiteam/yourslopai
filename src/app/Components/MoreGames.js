import Link from 'next/link';
import Image from 'next/image';
import styles from './MoreGames.module.css';

const ALL_GAMES = [
  {
    slug: 'main',
    href: '/#game',
    logo: '/logo-site.png',
    title: 'Your AI Slop Bores Me',
    desc: 'The original game — larp as AI, fool the judges, earn tokens.',
  },
  {
    slug: 'ai-or-human',
    href: '/games/ai-or-human',
    logo: '/logo-ai-or-human.png',
    title: 'AI or Human?',
    desc: 'Read a snippet and guess — was it written by AI or a real person?',
  },
  {
    slug: 'ai-roast',
    href: '/games/ai-roast',
    logo: '/logo-ai-roast.png',
    title: 'AI Roast Me',
    desc: 'Describe yourself and let AI deliver the most creative roast.',
  },
  {
    slug: 'story-chain',
    href: '/games/story-chain',
    logo: '/logo-story-chain.png',
    title: 'Story Chain',
    desc: 'Co-write a story with AI, one sentence at a time.',
  },
];

export default function MoreGames({ current }) {
  const games = ALL_GAMES.filter((g) => g.slug !== current);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>More Games</h2>
        <p className={styles.subtitle}>Try other AI mini-games on the site.</p>
        <div className={styles.grid}>
          {games.map((game) => (
            <Link key={game.slug} href={game.href} className={styles.card}>
              <div className={styles.logoWrap}>
                <Image
                  src={game.logo}
                  alt={game.title}
                  width={280}
                  height={280}
                  className={styles.logo}
                />
              </div>
              <h3>{game.title}</h3>
              <p>{game.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
