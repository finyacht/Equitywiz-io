const fs = require('fs');
const path = require('path');

// Try to require uglify-js, but provide a fallback if it's not available
let uglifyJS;
try {
    uglifyJS = require('uglify-js');
    console.log('Successfully loaded uglify-js module');
} catch (error) {
    console.error('Error loading uglify-js module:', error.message);
    console.log('Continuing build process without minification...');
    
    // Create a simple minification function that just returns the original code
    uglifyJS = {
        minify: function(code) {
            return { code: code };
        }
    };
}

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log('Created dist directory');
}

// Copy HTML files
const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
});
console.log(`Copied ${htmlFiles.length} HTML files`);

// Copy JS files from root
const jsFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file !== 'build.js');
jsFiles.forEach(file => {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
});
console.log(`Copied ${jsFiles.length} JS files from root`);

// Create css directory in dist
const distCssDir = path.join(distDir, 'css');
if (!fs.existsSync(distCssDir)) {
    fs.mkdirSync(distCssDir);
    console.log('Created css directory in dist');
}

// Copy CSS files
const cssDir = path.join(__dirname, 'css');
if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    cssFiles.forEach(file => {
        fs.copyFileSync(path.join(cssDir, file), path.join(distCssDir, file));
    });
    console.log(`Copied ${cssFiles.length} CSS files`);
} else {
    console.log('CSS directory not found');
}

// Create js directory in dist
const distJsDir = path.join(distDir, 'js');
if (!fs.existsSync(distJsDir)) {
    fs.mkdirSync(distJsDir);
    console.log('Created js directory in dist');
}

// Copy and minify JS files
const jsDir = path.join(__dirname, 'js');
if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir);
    let minifiedCount = 0;
    let copiedCount = 0;
    
    jsFiles.forEach(file => {
        const srcPath = path.join(jsDir, file);
        const destPath = path.join(distJsDir, file);
        
        if (file.endsWith('.js')) {
            try {
                // Read the file
                const code = fs.readFileSync(srcPath, 'utf8');
                
                // Minify the code
                const minified = uglifyJS.minify(code);
                
                if (minified.error) {
                    console.error(`Error minifying ${file}:`, minified.error);
                    // If minification fails, just copy the original file
                    fs.copyFileSync(srcPath, destPath);
                    copiedCount++;
                } else {
                    // Write the minified code
                    fs.writeFileSync(destPath, minified.code);
                    minifiedCount++;
                }
            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
                // If any error occurs, just copy the original file
                fs.copyFileSync(srcPath, destPath);
                copiedCount++;
            }
        } else {
            // For non-JS files, just copy
            fs.copyFileSync(srcPath, destPath);
            copiedCount++;
        }
    });
    
    console.log(`Processed ${jsFiles.length} JS files (${minifiedCount} minified, ${copiedCount} copied)`);
} else {
    console.log('JS directory not found');
}

// Copy Netlify functions
const netlifyDir = path.join(__dirname, 'netlify');
const distNetlifyDir = path.join(distDir, 'netlify');

if (fs.existsSync(netlifyDir)) {
    if (!fs.existsSync(distNetlifyDir)) {
        fs.mkdirSync(distNetlifyDir, { recursive: true });
        console.log('Created netlify directory in dist');
    }
    
    const functionsDir = path.join(netlifyDir, 'functions');
    const distFunctionsDir = path.join(distNetlifyDir, 'functions');
    
    if (fs.existsSync(functionsDir)) {
        if (!fs.existsSync(distFunctionsDir)) {
            fs.mkdirSync(distFunctionsDir, { recursive: true });
            console.log('Created netlify/functions directory in dist');
        }
        
        const functionFiles = fs.readdirSync(functionsDir);
        functionFiles.forEach(file => {
            fs.copyFileSync(path.join(functionsDir, file), path.join(distFunctionsDir, file));
        });
        console.log(`Copied ${functionFiles.length} Netlify function files`);
    } else {
        console.log('Netlify functions directory not found');
    }
} else {
    console.log('Netlify directory not found');
}

console.log('Build completed successfully!'); 