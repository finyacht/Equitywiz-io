const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

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
const jsFiles = fs.readdirSync(__dirname).filter(file => 
  file.endsWith('.js') && 
  !['build-script.js', 'server.js'].includes(file)
);
jsFiles.forEach(file => {
  fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
  console.log(`Copied ${file} to dist`);
});

// Copy server.js for Netlify functions
fs.copyFileSync(path.join(__dirname, 'server.js'), path.join(distDir, 'server.js'));
console.log('Copied server.js to dist');

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

// Create a netlify.toml file in the dist directory
const netlifyConfig = `
[build]
  publish = "."
  command = "echo 'Already built'"

[build.environment]
  NETLIFY_USE_NEXTJS = "false"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

fs.writeFileSync(path.join(distDir, 'netlify.toml'), netlifyConfig);
console.log('Created netlify.toml in dist directory');

// Create a package.json file in the dist directory
const packageJson = {
  "name": "waterfall-express-dist",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "path": "^0.12.7"
  }
};

fs.writeFileSync(
  path.join(distDir, 'package.json'), 
  JSON.stringify(packageJson, null, 2)
);
console.log('Created package.json in dist directory');

console.log('Build completed successfully!'); 