import Link from 'next/link';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Privacy Policy – Your AI Slop Bores Me',
  description: 'Privacy Policy for Your AI Slop Bores Me game website. Learn how we handle your data.',
};

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className={styles.legalPage}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: March 10, 2026</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to Your AI Slop Bores Me Game ("we", "us", "our"). This Privacy Policy explains
          how we collect, use, and protect information when you use our website at
          youraislopboresmegame.com (the "Site").
        </p>

        <h2>2. Information We Collect</h2>
        <p>We collect minimal information to provide and improve the game experience:</p>
        <ul>
          <li><strong>Game Data:</strong> Your game progress, token count, and chat history are stored locally in your browser (localStorage). We do not store this data on our servers.</li>
          <li><strong>Usage Analytics:</strong> We use Pageview Analytics to collect anonymized usage data such as page views and approximate geographic region. No personal identifiers are tracked.</li>
          <li><strong>IP Address:</strong> Your IP address is temporarily used for rate limiting to prevent abuse. It is not stored permanently or shared with third parties.</li>
          <li><strong>User-Generated Content:</strong> Text prompts and drawings you submit during gameplay are sent to third-party AI services (DeepSeek, KIE AI) for processing. We do not permanently store this content on our servers.</li>
        </ul>

        <h2>3. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>DeepSeek API:</strong> Processes text prompts and generates AI responses. Subject to <a href="https://www.deepseek.com/privacy" target="_blank" rel="noopener noreferrer">DeepSeek's Privacy Policy</a>.</li>
          <li><strong>KIE AI API:</strong> Generates images from text prompts. Subject to KIE AI's terms of service.</li>
          <li><strong>Google AdSense:</strong> Displays advertisements. Google may use cookies to serve personalized ads. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.</li>
          <li><strong>Pageview Analytics:</strong> Collects anonymized, cookie-free website analytics.</li>
        </ul>

        <h2>4. Cookies</h2>
        <p>
          Our Site itself does not set cookies. However, third-party services (such as Google AdSense)
          may set cookies on your device. You can manage cookie preferences through your browser settings.
        </p>

        <h2>5. Data Storage & Security</h2>
        <p>
          All game data is stored locally on your device. We do not maintain user accounts or databases
          of personal information. API requests are processed in real-time and not logged beyond
          temporary rate-limiting counters.
        </p>

        <h2>6. Children's Privacy</h2>
        <p>
          Our Site is not directed at children under 13. We do not knowingly collect personal
          information from children. If you believe a child has provided us with personal data,
          please contact us so we can take appropriate action.
        </p>

        <h2>7. Your Rights</h2>
        <p>Since we store minimal data, most privacy rights are automatically satisfied:</p>
        <ul>
          <li>You can clear all game data by clearing your browser's localStorage.</li>
          <li>You can opt out of personalized ads via Google's ad settings.</li>
          <li>You can block analytics by using a browser ad blocker.</li>
        </ul>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated "Last updated" date.
        </p>

        <h2>9. Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please reach out via our
          {' '}<a href="https://github.com/codaaiteam/yourslopai" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
        </p>

        <Link href="/" className={styles.backLink}>&larr; Back to Home</Link>
      </div>
      <Footer />
    </>
  );
}
