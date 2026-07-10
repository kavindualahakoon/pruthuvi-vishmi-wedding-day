import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/firebase-backup';
import { doc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contentRecord = await prisma.content.findFirst();
    return NextResponse.json(contentRecord ? JSON.parse(contentRecord.data) : {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const contentRecord = await prisma.content.findFirst();
    
    if (contentRecord) {
      await prisma.content.update({
        where: { id: contentRecord.id },
        data: { data: JSON.stringify(data), updatedAt: new Date() }
      });
    } else {
      await prisma.content.create({
        data: { data: JSON.stringify(data), updatedAt: new Date() }
      });
    }

    // Auto backup settings to Firebase Firestore settings/content document
    try {
      if (db) {
        const docRef = doc(db, 'settings', 'content');
        await setDoc(docRef, data);
      }
    } catch (firebaseError) {
      console.error('Failed to sync settings to Firebase:', firebaseError);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
