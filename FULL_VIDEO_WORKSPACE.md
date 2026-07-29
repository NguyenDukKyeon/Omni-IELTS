# Full-video learning workspace

The YouTube learning flow now prefers a complete caption-backed transcript before opening practice:

1. Resolve up to the first 180 seconds using cache, local companion, backend yt-dlp, then Gemini fallback.
2. Preserve video duration metadata.
3. Fetch remaining caption chunks in 180-second ranges until the known video duration is covered.
4. Split long caption rows into short timestamped practice utterances.
5. Open a two-column workspace with the YouTube player and learning loop on the left and a clickable transcript rail on the right.
6. Keep the existing Dictation, Noticing, Shadowing, Vocabulary, and Retell evidence rules unchanged.

If the full duration cannot be determined or a later provider call fails, the available transcript remains usable and is labelled as potentially incomplete.
