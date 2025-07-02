import { NextResponse } from 'next/server';

export async function GET() {
  const folder = 'cbe63f1227091681d25f9c9f4ad43e3320';
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?prefix=${folder}/&max_results=100`;
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  console.log(res)

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }

  const data = await res.json();
  // Return both public_id and secure_url for each image
  const images = data.resources.map((img: any) => ({
    public_id: img.public_id,
    url: img.secure_url,
  }));
  return NextResponse.json({ images });
} 