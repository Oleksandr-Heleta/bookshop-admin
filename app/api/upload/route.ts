import { writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const files: File[] = [];
  
  
  let index = 0;
  while (true) {
    const file = data.get(`Files[${index}]`) as File | null;
    if (!file) break;
    files.push(file);
    index++;
  }
  
  console.log("Retrieved files:", files);

  if (!files || files.length === 0) {
    return NextResponse.json({ success: false });
  }

  const filePaths = await Promise.all(files.map(async (file) => {
    const bytes = await file.arrayBuffer();
    const buffer = await sharp(bytes).toBuffer();
    const filePath = path.join(process.cwd(), 'public', file.name); // change public to images folder
    await writeFile(filePath, buffer);
    return {
      filePath,
      fileName: file.name
    };
  }));

  return NextResponse.json({ success: true, paths: filePaths });
}

export async function DELETE(request: NextRequest) {
  const requestBody = await request.json();

  if (!requestBody) {
    return NextResponse.json({ success: false, message: 'Request body is required' });
  }

  
  const { filename } = requestBody;

  if (!filename) {
    return NextResponse.json({ success: false, message: 'Filename is required' });
  }

  const filePath = path.join(process.cwd(), 'images', filename.replace(process.env.NEXT_PUBLIC_IMAGE_STORE_URL, ''));

  try {
    await fs.promises.access(filePath)
    await fs.promises.unlink(filePath)

    return NextResponse.json({ success: true, message: 'File deleted successfully' })
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error)
    return NextResponse.json({ success: false, message: 'Error deleting file' })
  }
}
