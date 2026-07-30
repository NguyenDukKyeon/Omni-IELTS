# Unsigned development fixtures

The legacy lesson files under `public/content/lessons/` are retained only as
unsigned development fixtures during the Phase 4 migration. They are not
referenced by the production signed catalog and must never be accepted by the
production trust path.

Production content is reachable only through `../catalog.json` after Ed25519
verification against `../trust-roots.json`.
