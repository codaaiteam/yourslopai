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
          <h3>Games</h3>
          <Link href="/games/ai-or-human">AI or Human?</Link>
          <Link href="/games/ai-roast">AI Roast Me</Link>
          <Link href="/games/story-chain">Story Chain</Link>
          <a href="https://www.82-0-challenge.com" target="_blank" rel="noopener">82-0 Challenge — NBA Team Builder</a>
          <a href="https://17-0-game.com/" target="_blank" rel="noopener">17-0 Challenge — NFL Team Builder</a>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.legal || 'Legal'}</h3>
          <Link href="/privacy">{t?.footer?.privacy || 'Privacy Policy'}</Link>
          <Link href="/terms">{t?.footer?.terms || 'Terms of Use'}</Link>
        </div>

        <div className={styles.footerSection}>
          <h3>Official</h3>
          <a href="https://youraislopbores.me">
            youraislopbores.me
          </a>
          <a href="mailto:contact@youraislopboresmegame.com">
            contact@youraislopboresmegame.com
          </a>
        </div>
      </div>

      <div className={styles.footerDesc}>
        <p>{t?.footer?.description || 'This is a fan-made page about Your AI Slop Bores Me. The game is created by mikidoodle.'}</p>
      </div>

      <div className={styles.copyright}>
        {t?.footer?.copyright || '© 2026 Your AI Slop Bores Me Fan Page'}
      </div>
        <span>·</span>
        <a href="https://7-0-game.com/" target="_blank" rel="noopener noreferrer">
        7-0 Game
        </a>



      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px 16px", width: "100%", padding: "8px 12px", fontSize: "13px", lineHeight: 1.6, opacity: 0.55, boxSizing: "border-box" }}>
        <a href="https://mecchachameleonpc.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Meccha Chameleon</a>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px 16px", width: "100%", padding: "8px 12px", fontSize: "13px", lineHeight: 1.6, opacity: 0.55, boxSizing: "border-box" }}>
        <a href="https://gakuran-codes.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Gakuran Codes</a>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px 16px", width: "100%", padding: "8px 12px", fontSize: "13px", lineHeight: 1.6, opacity: 0.55, boxSizing: "border-box" }}>
        <a href="https://thefenomenogame.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Fenomeno Game</a>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px 16px", width: "100%", padding: "8px 12px", fontSize: "13px", lineHeight: 1.6, opacity: 0.55, boxSizing: "border-box" }}>
        <a href="https://thefenomeno.org/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Fenômeno Legends</a>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px 16px", width: "100%", padding: "8px 12px", fontSize: "13px", lineHeight: 1.6, opacity: 0.55, boxSizing: "border-box" }}>
        <a href="https://thephenomenongame.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>The Phenomenon Game</a>
      </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px 16px", width: "100%", padding: "8px 12px", fontSize: "13px", lineHeight: 1.6, opacity: 0.55, boxSizing: "border-box" }}>
        <a href="https://73-9-game.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>73-9 Game</a>
      </div>
<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px 16px", width: "100%", padding: "8px 12px", fontSize: "13px", lineHeight: 1.6, opacity: 0.55, boxSizing: "border-box" }}>
  <a href="https://www.potrerojuego.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>juego de potrero</a>
  <a href="https://www.idolojuego.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>el idolo juego</a>
  <a href="https://www.coperojuego.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>copero juego</a>
</div>
</footer>
  );
};

export default Footer;
