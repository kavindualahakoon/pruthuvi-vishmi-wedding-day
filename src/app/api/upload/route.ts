import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { storage } from '@/lib/firebase-backup';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const originalName = file.name;
    const extension = path.extname(originalName);
    
    // Remove spaces and special chars from filename for safety
    const safeBaseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeBaseName}-${uniqueSuffix}${extension}`;
    
    if (storage) {
      // Upload to Firebase Storage server-side (bypasses Vercel disk EROFS limitation)
      try {
        const fileRef = ref(storage, `uploads/${fileName}`);
        await uploadBytes(fileRef, arrayBuffer, {
          contentType: file.type || 'image/jpeg'
        });
        const downloadUrl = await getDownloadURL(fileRef);
        return NextResponse.json({ url: downloadUrl });
      } catch (uploadError: any) {
        console.error('Firebase server-side upload failed:', uploadError);
        return NextResponse.json({ error: `Firebase Storage upload failed: ${uploadError.message}` }, { status: 500 });
      }
    }

    // Fallback to local storage (e.g. for local development or if Firebase fails)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    
    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
