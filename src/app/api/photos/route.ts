import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/firebase-backup';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(photos);
  } catch (dbError: any) {
    console.error('MySQL query failed, falling back to Firebase Firestore:', dbError);
    if (db) {
      try {
        const q = query(collection(db, 'guestPhotos'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const photos: any[] = [];
        querySnapshot.forEach((docSnap) => {
          photos.push({ id: docSnap.id, ...docSnap.data() });
        });
        return NextResponse.json(photos);
      } catch (firebaseError: any) {
        console.error('Firebase guestPhotos retrieval failed:', firebaseError);
        return NextResponse.json({ error: 'Both MySQL and Firebase failed' }, { status: 500 });
      }
    }
    return NextResponse.json({ error: `Database offline: ${dbError.message}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let photo: any = null;
    let mysqlFailed = false;

    try {
      photo = await prisma.photo.create({
        data: {
          url: data.url,
          originalName: data.originalName,
          uploaderName: data.uploaderName,
        }
      });
    } catch (dbError) {
      console.error('MySQL photo save failed, trying Firebase fallback:', dbError);
      mysqlFailed = true;
      // Fallback object for UI response if MySQL is down
      photo = {
        id: `fb-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        url: data.url,
        originalName: data.originalName,
        uploaderName: data.uploaderName,
        approved: false,
        createdAt: new Date(),
      };
    }

    // Sync to Firebase Firestore guestPhotos collection
    try {
      if (db) {
        const docRef = doc(db, 'guestPhotos', photo.id);
        await setDoc(docRef, {
          url: photo.url,
          uploaderName: photo.uploaderName,
          originalName: photo.originalName || null,
          approved: photo.approved || false,
          createdAt: photo.createdAt instanceof Date ? photo.createdAt.toISOString() : photo.createdAt,
        });
      } else if (mysqlFailed) {
        throw new Error('Firebase is not configured and MySQL is offline');
      }
    } catch (firebaseError: any) {
      console.error('Failed to sync photo to Firebase:', firebaseError);
      if (mysqlFailed) {
        return NextResponse.json({ error: `Upload failed: ${firebaseError.message}` }, { status: 500 });
      }
    }

    return NextResponse.json(photo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

