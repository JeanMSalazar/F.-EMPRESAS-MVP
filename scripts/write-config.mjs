import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env')) loadEnvFile('.env');

const url = process.env['SUPABASE_URL'] ?? process.env['PUBLIC_SUPABASE_URL'] ?? '';
const anon_key = process.env['SUPABASE_PUBLISHABLE_KEY']
  ?? process.env['SUPABASE_ANON_KEY']
  ?? process.env['PUBLIC_SUPABASE_ANON_KEY']
  ?? '';
mkdirSync('src/app', { recursive: true });
writeFileSync(
  'src/app/config.generated.ts',
  `export const public_config = ${JSON.stringify({ url, anon_key })} as const;\n`,
);
console.log(
  url && anon_key
    ? 'Supabase configurado.'
    : 'Modo demostración habilitado (sin credenciales Supabase).',
);
