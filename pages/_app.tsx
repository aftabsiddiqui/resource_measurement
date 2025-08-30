import { AppProps } from 'next/app'
import '../src/styles.css'

export default function App({ Component, pageProps }: AppProps) {
  // Server-side initialization is now handled automatically
  // No frontend API calls needed for initialization
  return <Component {...pageProps} />
}
