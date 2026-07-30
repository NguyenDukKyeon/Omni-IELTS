# Production channel

Production receives only artifacts that pass `validate:publish`, have exact
immutable addresses, and are signed inside a protected environment. Promotion
never edits an existing immutable pack revision.
