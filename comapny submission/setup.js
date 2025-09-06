#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up AI Knowledge Hub...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from env.example');
    console.log('⚠️  Please edit .env file with your actual values:\n');
    console.log('   - MONGODB_URI: Your MongoDB connection string');
    console.log('   - JWT_SECRET: A secure random string');
    console.log('   - GEMINI_API_KEY: Your Google Gemini API key\n');
  } else {
    console.log('❌ env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('📦 Installing dependencies...\n');

try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\nInstalling server dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'server') });
  
  console.log('\nInstalling client dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
  
  console.log('\n✅ All dependencies installed successfully!');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Make sure MongoDB is running');
console.log('3. Run: npm run dev');
console.log('\n📖 See README.md for detailed instructions');
