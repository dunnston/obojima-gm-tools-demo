import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Required for static export (Tauri build)
export const dynamic = 'force-static';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    if (!filename) {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'File must be an audio file' }, { status: 400 });
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the path to save the file
    const uploadDir = path.join(process.cwd(), 'public', 'audio', 'music');
    const filePath = path.join(uploadDir, filename);

    // Create the directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log(`Directory ensured: ${uploadDir}`);
    } catch (error) {
      console.log(`Directory might already exist: ${uploadDir}`);
    }

    // Check if file already exists and remove it first to avoid duplicates
    try {
      const fs = await import('fs/promises');
      await fs.unlink(filePath);
      console.log(`Removed existing file: ${filePath}`);
    } catch (error) {
      // File doesn't exist, which is fine
    }

    // Write the file
    await writeFile(filePath, buffer);

    console.log(`Audio file saved: ${filePath}`);

    return NextResponse.json({ 
      message: 'Audio file uploaded successfully', 
      filename,
      path: `/audio/music/${filename}`
    });

  } catch (error) {
    console.error('Error uploading audio file:', error);
    return NextResponse.json({ 
      error: 'Audio file upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}