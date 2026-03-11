import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Inter, -apple-system, sans-serif',
      color: '#333',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 700, margin: 0, color: '#222' }}>404</h1>
      <p style={{ fontSize: '1.1rem', color: '#888', marginTop: '0.5rem' }}>
        This page could not be found.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '1.5rem',
          padding: '0.7rem 2rem',
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
