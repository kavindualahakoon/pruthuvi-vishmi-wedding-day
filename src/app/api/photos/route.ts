import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/firebase-backup';
import { doc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(photos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const photo = await prisma.photo.create({
      data: {
        url: data.url,
        originalName: data.originalName,
        uploaderName: data.uploaderName,
      }
    });

    // Sync to Firebase Firestore guestPhotos collection
    try {
      if (db) {
        const docRef = doc(db, 'guestPhotos', photo.id);
        await setDoc(docRef, {
          url: photo.url,
          uploaderName: photo.uploaderName,
          originalName: photo.originalName || null,
          approved: photo.approved,
          createdAt: photo.createdAt.toISOString(),
        });
      } else {
        console.warn('Firebase is not configured. Skipping Firestore sync.');
      }
    } catch (firebaseError) {
      console.error('Failed to sync photo to Firebase:', firebaseError);
    }

    return NextResponse.json(photo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

