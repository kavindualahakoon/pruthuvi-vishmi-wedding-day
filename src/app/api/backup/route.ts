import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db, storage } from '@/lib/firebase-backup';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

async function uploadLocalFileToFirebase(localPath: string): Promise<string | null> {
  if (!storage) return null;
  try {
    const fileName = path.basename(localPath);
    const absolutePath = path.join(process.cwd(), 'public', localPath);
    
    // Check if local file exists
    try {
      await fs.access(absolutePath);
    } catch {
      console.warn(`Local file not found for upload: ${absolutePath}`);
      return null;
    }
    
    const buffer = await fs.readFile(absolutePath);
    const fileRef = ref(storage, `uploads/${fileName}`);
    
    // Detect mime type
    let contentType = 'image/jpeg';
    if (fileName.endsWith('.png')) contentType = 'image/png';
    else if (fileName.endsWith('.gif')) contentType = 'image/gif';
    else if (fileName.endsWith('.webm')) contentType = 'video/webm';
    else if (fileName.endsWith('.mp4')) contentType = 'video/mp4';
    else if (fileName.endsWith('.mp3')) contentType = 'audio/mpeg';
    
    await uploadBytes(fileRef, buffer, { contentType });
    const downloadUrl = await getDownloadURL(fileRef);
    return downloadUrl;
  } catch (error) {
    console.error(`Failed to upload local file ${localPath} to Firebase:`, error);
    return null;
  }
}

async function runBackup() {
  if (!db) {
    throw new Error('Firebase connection is not configured on the server. Please check your environment variables.');
  }

  // 1. Fetch and migrate Photos
  const photos = await prisma.photo.findMany();
  for (const photo of photos) {
    let finalUrl = photo.url;
    if (photo.url.startsWith('/uploads/')) {
      const cloudUrl = await uploadLocalFileToFirebase(photo.url);
      if (cloudUrl) {
        finalUrl = cloudUrl;
        // Update MySQL row
        await prisma.photo.update({
          where: { id: photo.id },
          data: { url: cloudUrl }
        });
      }
    }
    
    // Sync to Firestore
    const docRef = doc(db, 'guestPhotos', photo.id);
    await setDoc(docRef, {
      url: finalUrl,
      uploaderName: photo.uploaderName,
      originalName: photo.originalName || null,
      approved: photo.approved,
      createdAt: photo.createdAt.toISOString(),
    });
  }

  // 2. Fetch and migrate Content settings
  const contentRecord = await prisma.content.findFirst();
  if (contentRecord) {
    let dataObj = JSON.parse(contentRecord.data);
    
    // Recursive function to replace all /uploads/ paths with Firebase Storage URLs
    async function scanAndUpload(obj: any): Promise<any> {
      if (!obj) return obj;
      if (typeof obj === 'string' && obj.startsWith('/uploads/')) {
        const cloudUrl = await uploadLocalFileToFirebase(obj);
        return cloudUrl || obj;
      }
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          obj[i] = await scanAndUpload(obj[i]);
        }
        return obj;
      }
      if (typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          obj[key] = await scanAndUpload(obj[key]);
        }
        return obj;
      }
      return obj;
    }
    
    dataObj = await scanAndUpload(dataObj);
    
    // Update MySQL
    await prisma.content.update({
      where: { id: contentRecord.id },
      data: { data: JSON.stringify(dataObj), updatedAt: new Date() }
    });
    
    // Sync to Firestore
    const docRef = doc(db, 'settings', 'content');
    await setDoc(docRef, dataObj);
  }

  // 3. Fetch and migrate RSVPs
  const rsvps = await prisma.rsvp.findMany();
  for (const rsvp of rsvps) {
    const docRef = doc(db, 'rsvps', rsvp.id);
    await setDoc(docRef, {
      name: rsvp.name,
      email: rsvp.email,
      guests: rsvp.guests,
      attending: rsvp.attending,
      dietary: rsvp.dietary || null,
      message: rsvp.message || null,
      createdAt: rsvp.createdAt.toISOString(),
    });
  }

  return { success: true, message: 'Local assets migrated to Storage, and database backed up to Firestore successfully!' };
}

export async function GET() {
  try {
    const result = await runBackup();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Backup Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await runBackup();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Backup Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
