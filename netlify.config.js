// Netlify configuration file
module.exports = {
  // Disable Next.js plugin
  onPreBuild: ({ utils }) => {
    console.log('Explicitly disabling Next.js plugin...');
    process.env.NETLIFY_NEXT_PLUGIN_SKIP = 'true';
    process.env.NETLIFY_USE_NEXTJS = 'false';
    utils.status.show({ summary: 'Next.js plugin disabled' });
  }
}; 