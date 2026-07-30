# Signing and secret handling

- Private signing keys are provisioned only in a protected publishing
  environment.
- The signing CLI accepts
  `CONTENT_SIGNING_PRIVATE_KEY_PKCS8_BASE64` and
  `CONTENT_SIGNING_KEY_ID` through environment variables.
- The learner repository contains only public trust roots and signed artifacts.
- Reviewers must rotate a key by bundling the next public key before a catalog
  is signed exclusively by that key.
- Suspected key exposure stops publishing immediately and follows the
  revocation/rollback runbook.
