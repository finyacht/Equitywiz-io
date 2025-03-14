const UglifyJS = require('uglify-js');
const fs = require('fs');
const path = require('path');

// Files to minify
const files = [
  { src: 'js/waterfallCalculator.js', dest: 'js/waterfallCalculator.min.js' },
  { src: 'js/main.js', dest: 'js/main.min.js' }
];

// Minify each file
files.forEach(file => {
  console.log(`Minifying ${file.src}...`);
  
  // Read the file
  const code = fs.readFileSync(file.src, 'utf8');
  
  // Minify with advanced options
  const result = UglifyJS.minify(code, {
    compress: {
      drop_console: true,
      drop_debugger: true,
      global_defs: {
        DEBUG: false
      }
    },
    mangle: {
      reserved: ['waterfallCalculator'], // Keep the main export name
      properties: true // Mangle property names
    },
    output: {
      comments: false
    }
  });
  
  if (result.error) {
    console.error(`Error minifying ${file.src}:`, result.error);
    return;
  }
  
  // Write the minified code to the destination
  fs.writeFileSync(file.dest, result.code, 'utf8');
  console.log(`Successfully minified ${file.src} to ${file.dest}`);
}); 