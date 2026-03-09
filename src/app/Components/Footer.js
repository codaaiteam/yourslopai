import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = ({ t }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <div className={styles.footerSection}>
          <h3>{t?.footer?.pages || 'Pages'}</h3>
          <Link href="/">{t?.footer?.home || 'Home'}</Link>
          <a href="#about">{t?.footer?.about || 'About the Game'}</a>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.legal || 'Legal'}</h3>
          <Link href="/privacy">{t?.footer?.privacy || 'Privacy Policy'}</Link>
          <Link href="/terms">{t?.footer?.terms || 'Terms of Use'}</Link>
        </div>

        <div className={styles.footerSection}>
          <h3>Official</h3>
          <a href="https://www.youraislopbores.me" target="_blank" rel="noopener noreferrer">
            Your AI Slop Bores Me
          </a>
          <a href="https://www.youraislopboresmegame.com/" target="_blank" rel="noopener noreferrer">
            Your AI Slop Bores Me Game
          </a>
        </div>
      </div>

      <div className={styles.footerDesc}>
        <p>{t?.footer?.description || 'This is a fan-made page about Your AI Slop Bores Me. The game is created by mikidoodle.'}</p>
      </div>

      <div className={styles.copyright}>
        {t?.footer?.copyright || '© 2026 Your AI Slop Bores Me Fan Page'}
      </div>
    </footer>
  );
};

export default Footer;
