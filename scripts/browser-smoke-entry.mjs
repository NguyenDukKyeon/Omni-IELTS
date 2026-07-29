// Dedicated E2E flag. The application only consumes this in Vite development
// while navigator.webdriver is true; production builds never auto-seed data.
process.env.VITE_BROWSER_SMOKE_SEED='1';
await import('./browser-smoke.mjs');
