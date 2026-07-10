import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/firebase-backup';
import { doc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!db) {
      throw new Error('Firebase connection is not configured on the server. Please check your environment variables.');
    }

    // 1. Fetch all data from MySQL
    const rsvps = await prisma.rsvp.findMany();
    const photos = await prisma.photo.findMany();
    const contentRecord = await prisma.content.findFirst();

    // 2. Upload RSVPs to Firebase
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

    // 3. Upload Photos to Firebase
    for (const photo of photos) {
      const docRef = doc(db, 'guestPhotos', photo.id);
      await setDoc(docRef, {
        url: photo.url,
        uploaderName: photo.uploaderName,
        originalName: photo.originalName || null,
        approved: photo.approved,
        createdAt: photo.createdAt.toISOString(),
      });
    }

    // 4. Upload Content to Firebase
    if (contentRecord) {
      const docRef = doc(db, 'settings', 'content');
      let dataObj = {};
      try {
        dataObj = JSON.parse(contentRecord.data);
      } catch (e) {}
      await setDoc(docRef, dataObj);
    }

    return NextResponse.json({ success: true, message: 'Backup to Firebase completed successfully.' });
  } catch (error: any) {
    console.error('Backup Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
