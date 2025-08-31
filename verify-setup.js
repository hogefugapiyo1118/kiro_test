const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying project setup...\n');

// Check backend structure
const backendFiles = [
  'backend/package.json',
  'backend/src/server.ts',
  'backend/src/config/database.ts',
  'backend/src/middleware/auth.ts',
  'backend/src/middleware/errorHandler.ts',
  'backend/src/types/index.ts',
  'backend/.env.example',
  'backend/tsconfig.json'
];

console.log('📁 Backend files:');
backendFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check frontend structure
const frontendFiles = [
  'frontend/package.json',
  'frontend/src/main.tsx',
  'frontend/src/App.tsx',
  'frontend/src/lib/supabase.ts',
  'frontend/src/services/api.ts',
  'frontend/src/contexts/AuthContext.tsx',
  'frontend/src/types/index.ts',
  'frontend/.env.example',
  'frontend/tsconfig.json',
  'frontend/vite.config.ts',
  'frontend/tailwind.config.js',
  'frontend/index.html'
];

console.log('\n📁 Frontend files:');
frontendFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check database and deployment files
const otherFiles = [
  'database/schema.sql',
  'render.yaml',
  'README.md'
];

console.log('\n📁 Other files:');
otherFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n✨ Project setup verification complete!');
console.log('\n📋 Next steps:');
console.log('1. Create a Supabase project and run database/schema.sql');
console.log('2. Copy .env.example files and add your Supabase credentials');
console.log('3. Install dependencies: npm install (in both backend and frontend)');
console.log('4. Start development servers: npm run dev (in both directories)');
console.log('5. Deploy to Render using render.yaml configuration');