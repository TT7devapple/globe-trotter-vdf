/**
 * Création du compte administrateur initial.
 * Usage : npm run db:seed
 *
 * Le mot de passe n'est JAMAIS stocké en clair : seul son condensat bcrypt
 * est enregistré. Relancer ce script met à jour le mot de passe du compte
 * existant, ce qui sert aussi de procédure de réinitialisation.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Globe Trotter Val de Fontenay';

  if (!email || !password) {
    console.error(
      '\n  ✖ ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans .env\n\n' +
        '    Exemple :\n' +
        '      ADMIN_EMAIL="contact@globetrotter-vdf.fr"\n' +
        '      ADMIN_PASSWORD="un-mot-de-passe-long-et-unique"\n'
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('\n  ✖ ADMIN_PASSWORD doit faire au moins 12 caractères.\n');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  console.log(`\n  ✓ Compte administrateur prêt : ${user.email}`);
  console.log('    Connexion sur /admin/login\n');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
