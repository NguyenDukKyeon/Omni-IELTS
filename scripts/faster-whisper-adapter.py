import argparse
import json


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--language", default="en")
    args = parser.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise SystemExit("faster-whisper is not installed; no model was downloaded") from exc

    model = WhisperModel(args.model, device="cpu", compute_type="int8", local_files_only=True)
    segments, _ = model.transcribe(args.input, language=args.language, vad_filter=True)
    rows = []
    for segment in segments:
        rows.append({
            "start": float(segment.start),
            "end": float(segment.end),
            "text": str(segment.text).strip(),
            "language": args.language,
        })
    with open(args.output, "w", encoding="utf-8", newline="\n") as handle:
        json.dump({"segments": rows}, handle, ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    main()
