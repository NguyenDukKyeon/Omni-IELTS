# Caption overlap regression

Automatic YouTube captions may use rolling windows with overlapping timestamps. The client normalizer repairs adjacent boundaries before validation and uses a new segmenter cache version so stale normalized entries are not reused.
