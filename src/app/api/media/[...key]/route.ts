import { NextRequest, NextResponse } from "next/server";
import { getMediaBucket } from "@/lib/media";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = key.join("/");

  const bucket = await getMediaBucket();
  const object = await bucket.get(objectKey);

  if (!object) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(object.body, {
    headers: {
      "Content-Type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      // Photos are content-addressed by a random UUID in the key, so a
      // long, immutable cache is safe.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
