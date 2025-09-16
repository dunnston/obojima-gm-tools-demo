import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  // Check if in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    return NextResponse.json({
      error: 'Image upload is not available in demo mode. In the full version, you can upload custom images for your items.'
    }, { status: 403 });
  }

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

    console.log(`File saved: ${filePath}`);

    return NextResponse.json({ 
      message: 'File uploaded successfully', 
      filename,
      path: `/images/${subfolder}/${filename}`
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: 'File upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}