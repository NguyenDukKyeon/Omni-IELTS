# Overlapping caption normalization fix

YouTube automatic captions may overlap heavily because rolling caption windows remain visible while the next window starts. VocabMaster now repairs adjacent timestamp boundaries before validating sentence segments, while preserving the original text and start time whenever possible.

The transcript cache key uses sentence segmenter version 2 so previously normalized transcript cache entries cannot mask this fix.
