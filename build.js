const fs = require('fs');
const path = require('path');
const uglifyJS = require('uglify-js');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Copy HTML files
const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
});

// Copy JS files from root
const jsFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file !== 'build.js');
jsFiles.forEach(file => {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
});

// Create css directory in dist
const distCssDir = path.join(distDir, 'css');
if (!fs.existsSync(distCssDir)) {
    fs.mkdirSync(distCssDir);
}

// Copy CSS files
const cssDir = path.join(__dirname, 'css');
if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    cssFiles.forEach(file => {
        fs.copyFileSync(path.join(cssDir, file), path.join(distCssDir, file));
    });
}

// Create js directory in dist
const distJsDir = path.join(distDir, 'js');
if (!fs.existsSync(distJsDir)) {
    fs.mkdirSync(distJsDir);
}

// Copy and minify JS files
const jsDir = path.join(__dirname, 'js');
if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir);
    jsFiles.forEach(file => {
        const srcPath = path.join(jsDir, file);
        const destPath = path.join(distJsDir, file);
        
        if (file.endsWith('.js')) {
            // Read the file
            const code = fs.readFileSync(srcPath, 'utf8');
            
            // Minify the code
            const minified = uglifyJS.minify(code);
            
            if (minified.error) {
                console.error(`Error minifying ${file}:`, minified.error);
                // If minification fails, just copy the original file
                fs.copyFileSync(srcPath, destPath);
            } else {
                // Write the minified code
                fs.writeFileSync(destPath, minified.code);
            }
        } else {
            // For non-JS files, just copy
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

console.log('Build completed successfully!'); 