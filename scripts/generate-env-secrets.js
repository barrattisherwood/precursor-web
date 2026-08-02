// Vercel build-time step only — writes src/environments/environment.secrets.ts from the
// ADMIN_SECRET environment variable, since that file is gitignored and won't exist in a
// fresh checkout. Not wired into local npm scripts: local dev maintains its own
// environment.secrets.ts by hand (see environment.secrets.example.ts), and running this
// automatically on `npm start` would silently overwrite it with an empty string.
const fs = require('fs');
const path = require('path');

const secret = process.env.ADMIN_SECRET || '';
const filePath = path.join(__dirname, '..', 'src', 'environments', 'environment.secrets.ts');

fs.writeFileSync(
  filePath,
  `// Auto-generated at build time from the ADMIN_SECRET environment variable. Do not edit directly.\nexport const adminSecret = '${secret}';\n`,
);

console.log(`environment.secrets.ts generated (ADMIN_SECRET ${secret ? 'set' : 'NOT set — using empty string'}).`);
