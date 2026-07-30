# VocabMaster Content Publication Scaffold

Status: `EXTERNAL_REPOSITORY_PROVISIONING_PENDING`

This directory is an isolated, publishable scaffold for the future
`VocabMaster-content` repository. No separate remote repository has been
provisioned or claimed by this implementation.

The learner application consumes only immutable publication artifacts produced
by this scaffold. It does not import authoring scripts, review registries,
credentials or private signing keys.

## Boundaries

- `catalog-source/` contains editable channel catalog sources.
- `packs/` contains immutable-version pack sources and draft lesson content.
- `assets/` contains source assets; publication copies are named by SHA-256.
- `registries/` records rights, provenance and human review evidence.
- `scripts/` validates, assembles and signs publication artifacts.
- `channels/` documents staging and production promotion rules.
- `runbooks/` documents revocation, rollback and key rotation.

AI-assisted material in this scaffold remains a draft. It cannot pass
publication validation until a named human rights/content reviewer records an
approval over the exact immutable digest.

## Commands

```text
npm run validate:drafts
npm run validate:publish
npm run build:staging
npm run sign:staging
```

`validate:publish` intentionally fails while review or rights records are
pending. `sign:staging` requires an environment-provided PKCS#8 Ed25519 private
key and never writes that key to disk.
