
import type { AppProps } from 'next/app';  

import '../styles/globals.css'; // ✅ This is the correct place

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;