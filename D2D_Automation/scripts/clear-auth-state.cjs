const fs = require('node:fs');
const path = require('node:path');

// Scope: resolve the same storageState file path used by Playwright tests.
const authFile = path.resolve(__dirname, '../playwright/.auth/user.json');

// Scope: delete the saved login state when it exists so setup can create a fresh one.
if (fs.existsSync(authFile)) {
  fs.rmSync(authFile);
  console.log(`Deleted saved auth state: ${authFile}`);
} else {
  console.log(`No saved auth state found at: ${authFile}`);
}
