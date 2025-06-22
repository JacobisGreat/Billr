#!/usr/bin/env node

/**
 * Helper script to update Firebase Functions configuration with the current dev server URL
 * Usage: node update-dev-url.js [port]
 * Example: node update-dev-url.js 3002
 * 
 * If no port is provided, it will use 3000 as default.
 */

const { execSync } = require('child_process');

// Get port from command line argument or default to 3000
const port = process.argv[2] || '3000';
const url = `http://localhost:${port}`;

console.log(`🔧 Updating Firebase Functions configuration...`);
console.log(`📍 Setting app URL to: ${url}`);

try {
  // Set the Firebase configuration
  execSync(`firebase functions:config:set app.url="${url}"`, { stdio: 'inherit' });
  
  console.log(`✅ Configuration updated successfully!`);
  console.log(`📧 Email links will now use: ${url}/pay/INVOICE_ID?amount=AMOUNT`);
  console.log('');
  console.log('🚀 To apply changes, run:');
  console.log('   firebase deploy --only functions');
  console.log('');
  console.log('💡 Pro tip: You can also run this script with a specific port:');
  console.log('   node update-dev-url.js 3002');
  
} catch (error) {
  console.error('❌ Error updating configuration:', error.message);
  process.exit(1);
} 