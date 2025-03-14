import React from 'react';
import '../src/styles/globals.css';

function MyApp({ Component, pageProps }) {
  return React.createElement(Component, pageProps);
}

export default MyApp; 