/**
 * Génère un condensat bcrypt pour un mot de passe, et un AUTH_SECRET.
 * Usage : npm run admin:hash -- "mon-mot-de-passe"
 */
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

async function main() {
  const password = process.argv[2];

  console.log('\n  AUTH_SECRET suggéré :');
  console.log(`  ${randomBytes(48).toString('hex')}\n`);

  if (!password) {
    console.log('  Pour obtenir aussi un condensat de mot de passe :');
    console.log('    npm run admin:hash -- "votre-mot-de-passe"\n');
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  console.log('  Condensat bcrypt :');
  console.log(`  ${hash}\n`);
}

main();
