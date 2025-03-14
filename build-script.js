const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('Created dist directory');
}

// Create css directory in dist if it doesn't exist
const distCssDir = path.join(distDir, 'css');
if (!fs.existsSync(distCssDir)) {
  fs.mkdirSync(distCssDir, { recursive: true });
  console.log('Created dist/css directory');
}

// Create js directory in dist if it doesn't exist
const distJsDir = path.join(distDir, 'js');
if (!fs.existsSync(distJsDir)) {
  fs.mkdirSync(distJsDir, { recursive: true });
  console.log('Created dist/js directory');
}

// Copy HTML files
const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
  fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
  console.log(`Copied ${file} to dist`);
});

// Copy JS files from root
const jsFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file !== 'build-script.js');
jsFiles.forEach(file => {
  fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
  console.log(`Copied ${file} to dist`);
});

// Copy CSS files from css directory
if (fs.existsSync(path.join(__dirname, 'css'))) {
  const cssFiles = fs.readdirSync(path.join(__dirname, 'css')).filter(file => file.endsWith('.css'));
  cssFiles.forEach(file => {
    fs.copyFileSync(path.join(__dirname, 'css', file), path.join(distCssDir, file));
    console.log(`Copied css/${file} to dist/css`);
  });
}

// Copy JS files from js directory
if (fs.existsSync(path.join(__dirname, 'js'))) {
  const jsFilesInJsDir = fs.readdirSync(path.join(__dirname, 'js')).filter(file => file.endsWith('.js'));
  jsFilesInJsDir.forEach(file => {
    fs.copyFileSync(path.join(__dirname, 'js', file), path.join(distJsDir, file));
    console.log(`Copied js/${file} to dist/js`);
  });
}

// Create a Netlify _redirects file for SPA routing
fs.writeFileSync(path.join(distDir, '_redirects'), '/* /index.html 200');
console.log('Created _redirects file for SPA routing');

console.log('Build completed successfully!'); 