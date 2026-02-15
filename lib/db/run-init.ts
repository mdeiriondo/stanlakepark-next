import { config } from 'dotenv';

config({ path: '.env.local' });

void import('./init').then((m) =>
  m.initDatabase().catch((e) => {
    console.error(e);
    process.exit(1);
  })
);
