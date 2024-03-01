import { writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs';

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) {
    return NextResponse.json({ success: false })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filePath = path.join(process.cwd(), 'public', file.name);
  await writeFile(filePath, buffer);
  
  return NextResponse.json({ success: true, path: filePath})

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

  const filePath = path.join(process.cwd(), 'public', filename.replace(process.env.NEXT_PUBLIC_IMAGE_STORE_URL, ''));

  try {
    await fs.promises.access(filePath)
    await fs.promises.unlink(filePath)

    return NextResponse.json({ success: true, message: 'File deleted successfully' })
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error)
    return NextResponse.json({ success: false, message: 'Error deleting file' })
  }
}
