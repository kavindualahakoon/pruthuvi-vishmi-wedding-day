import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/firebase-backup';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contentRecord = await prisma.content.findFirst();
    return NextResponse.json(contentRecord ? JSON.parse(contentRecord.data) : {});
  } catch (dbError) {
    console.error('MySQL content query failed, falling back to Firebase Firestore:', dbError);
    if (db) {
      try {
        const docRef = doc(db, 'settings', 'content');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return NextResponse.json(docSnap.data());
        }
      } catch (firebaseError) {
        console.error('Firebase settings content retrieval failed:', firebaseError);
      }
    }
    return NextResponse.json({});
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let mysqlFailed = false;

    try {
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
    } catch (dbError) {
      console.error('MySQL settings save failed, continuing with Firebase fallback:', dbError);
      mysqlFailed = true;
    }

    // Auto backup settings to Firebase Firestore settings/content document
    try {
      if (db) {
        const docRef = doc(db, 'settings', 'content');
        await setDoc(docRef, data);
      } else if (mysqlFailed) {
        throw new Error('Firebase is not configured and MySQL is offline');
      }
    } catch (firebaseError: any) {
      console.error('Failed to sync settings to Firebase:', firebaseError);
      if (mysqlFailed) {
        return NextResponse.json({ error: firebaseError.message }, { status: 500 });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
