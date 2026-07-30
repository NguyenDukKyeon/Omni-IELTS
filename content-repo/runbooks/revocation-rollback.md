# Revocation, rollback and key rotation

## Content defect or rights withdrawal

1. Stop promotion of the affected revision.
2. Record a `PackRevocation` with pack ID, exact revision, reason code,
   explanatory text and timestamp.
3. Increment catalog sequence.
4. If a known-good older revision is allowed, add an explicit rollback object
   whose `fromRevision` equals the current catalog revision and whose
   `toRevision` equals the target.
5. Validate, sign and publish the new catalog.
6. Verify that installed clients block new launches while historical progress,
   receipts and evidence remain readable.

## Signing-key incident

1. Disable the protected publishing credential.
2. Do not remove the old public key from already released clients.
3. Ship a client update bundling the replacement public key and overlapping
   validity metadata.
4. Sign the next higher catalog sequence with the replacement key.
5. Revoke affected catalog/pack revisions explicitly; never rely on HTTPS or
   mutable-object replacement.

## Rollback safety

Rollback changes only catalog/activation pointers. It never lowers IndexedDB
versions, deletes unfamiliar stores, erases install journals, or rewrites an
immutable pack in place.
