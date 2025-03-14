import React from 'react';
import Head from 'next/head';
import { WaterfallProvider } from '../src/utils/WaterfallContext';
import ShareClassTable from '../src/components/ShareClassTable';
import TransactionTable from '../src/components/TransactionTable';
import WaterfallResults from '../src/components/WaterfallResults';

export default function Home() {
  return React.createElement(
    WaterfallProvider,
    null,
    React.createElement(
      'div',
      null,
      React.createElement(
        Head,
        null,
        React.createElement('title', null, 'Waterfall Analysis Tool'),
        React.createElement('meta', { 
          name: 'description', 
          content: 'A tool for analyzing waterfall distributions in equity financing' 
        }),
        React.createElement('link', { rel: 'icon', href: '/favicon.ico' })
      ),
      React.createElement(
        'main',
        null,
        React.createElement('h1', null, 'Waterfall Analysis Tool'),
        React.createElement(
          'div',
          { className: 'grid' },
          React.createElement(ShareClassTable, null),
          React.createElement(TransactionTable, null)
        ),
        React.createElement(WaterfallResults, null)
      )
    )
  );
} 