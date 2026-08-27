import { NextRequest, NextResponse } from "next/server";
import { getMediaBucket } from "@/lib/media";

/**
 * Streams an object out of the private R2 bucket.
 *
 * Range requests matter here: iOS Safari sends `Range: bytes=0-1` before it
 * will play any video, and treats a 200 with the whole body as a failure -
 * the video simply never starts. Chrome tolerates it but cannot seek. So we
 * honour Range and always advertise `Accept-Ranges: bytes`.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = key.join("/");
  const bucket = await getMediaBucket();

  const rangeHeader = req.headers.get("range");

  // No Range header: hand back the whole object.
  if (!rangeHeader) {
    const object = await bucket.get(objectKey);
    if (!object) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return new NextResponse(object.body, {
      headers: {
        "Content-Type":
          object.httpMetadata?.contentType ?? "application/octet-stream",
        "Content-Length": String(object.size),
        "Accept-Ranges": "bytes",
        // Keys are content-addressed by a random UUID, so this is safe.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // "bytes=START-END", where END is optional.
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) {
    return new NextResponse(null, { status: 416 });
  }

  const head = await bucket.head(objectKey);
  if (!head) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const total = head.size;

  const startRaw = match[1];
  const endRaw = match[2];

  let start: number;
  let end: number;
  if (startRaw === "") {
    // Suffix form: "bytes=-500" means the last 500 bytes.
    const suffix = Number(endRaw);
    if (!Number.isFinite(suffix) || suffix <= 0) {
      return new NextResponse(null, { status: 416 });
    }
    start = Math.max(0, total - suffix);
    end = total - 1;
  } else {
    start = Number(startRaw);
    end = endRaw === "" ? total - 1 : Number(endRaw);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) {
    return new NextResponse(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${total}` },
    });
  }
  end = Math.min(end, total - 1);
  const length = end - start + 1;

  const object = await bucket.get(objectKey, { range: { offset: start, length } });
  if (!object) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(object.body, {
    status: 206,
    headers: {
      "Content-Type":
        head.httpMetadata?.contentType ?? "application/octet-stream",
      "Content-Length": String(length),
      "Content-Range": `bytes ${start}-${end}/${total}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
