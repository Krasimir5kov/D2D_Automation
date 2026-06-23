import path from 'path';

// Scope: centralize the folder that stores Playwright authentication state.
export const AUTH_DIR = path.resolve(__dirname, '../../playwright/.auth');

// Scope: centralize the storage state file used by UI and API tests.
export const AUTH_FILE = path.join(AUTH_DIR, 'user.json');

// Scope: give manual 2FA login enough time by default without making the setup endless.
export const DEFAULT_MANUAL_AUTH_TIMEOUT_MINUTES = 15;
