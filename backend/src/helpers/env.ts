import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export function upsertEnv(key: string, value: string): void {
  const envConfig = dotenv.parse(fs.readFileSync(path.resolve('.env')));

  envConfig[key] = value;

  const envConfigString = Object.keys(envConfig)
    .map(key => `${key}=${envConfig[key]}`)
    .join('\n');

  fs.writeFileSync(path.resolve('.env'), envConfigString);
  // After updating the .env file, reload the environment variables
  dotenv.config({ override: true });
}
