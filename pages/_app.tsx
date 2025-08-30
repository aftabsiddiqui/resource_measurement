import { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../src/styles.css'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize application services on client-side startup
    const initializeApp = async () => {
      try {
        const response = await fetch('/api/init', { method: 'POST' });
        const result = await response.json();
        console.log('App initialization:', result.message);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  return <Component {...pageProps} />
}
