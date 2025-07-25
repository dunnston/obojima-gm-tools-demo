import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;
    const subfolder = formData.get('subfolder') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    if (!filename || !subfolder) {
      return NextResponse.json({ error: 'Missing filename or subfolder' }, { status: 400 });
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the path to save the file
    const uploadDir = path.join(process.cwd(), 'public', 'images', subfolder);
    const filePath = path.join(uploadDir, filename);

    // Check if file already exists and remove it first to avoid duplicates
    try {
      const fs = await import('fs/promises');
      await fs.unlink(filePath);
      console.log(`Removed existing file: ${filePath}`);
    } catch (error) {
      // File doesn't exist, which is fine
    }

    // Create the directory if it doesn't exist
    await writeFile(filePath, buffer);

    console.log(`File saved: ${filePath}`);

    return NextResponse.json({ 
      message: 'File uploaded successfully', 
      filename,
      path: `/images/${subfolder}/${filename}`
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}