// Simple verification script for Enterprise Insights Copilot v2.0
console.log("Verification script for Enterprise Insights Copilot v2.0");

// Verify component file structure
const fs = require('fs');
const path = require('path');

const componentPath = path.join(__dirname, 'components', 'SimpleNavHeader.tsx');
const layoutPath = path.join(__dirname, 'app', 'layout.tsx');
const pagePath = path.join(__dirname, 'app', 'page.tsx');

console.log('\nVerifying file structure:');
console.log(`- SimpleNavHeader.tsx exists: ${fs.existsSync(componentPath) ? '✅' : '❌'}`);
console.log(`- layout.tsx exists: ${fs.existsSync(layoutPath) ? '✅' : '❌'}`);
console.log(`- page.tsx exists: ${fs.existsSync(pagePath) ? '✅' : '❌'}`);

console.log('\nVerification complete! Ready to start the application.');
console.log('To start the application, run: npm run dev');
