"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalSetup;
const child_process_1 = require("child_process");
// Runs once before all tests: create a fresh, empty test database.
async function globalSetup() {
    (0, child_process_1.execSync)('npx prisma db push --force-reset --accept-data-loss --skip-generate', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    });
}
