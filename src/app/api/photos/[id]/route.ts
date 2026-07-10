import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/firebase-backup';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const photo = await prisma.photo.update({
      where: { id },
      data: { approved: data.approved }
    });

    // Sync update to Firebase Firestore guestPhotos collection
    try {
      if (db) {
        const docRef = doc(db, 'guestPhotos', id);
        await updateDoc(docRef, { approved: data.approved });
      }
    } catch (firebaseError) {
      console.error('Failed to update photo in Firebase:', firebaseError);
    }

    return NextResponse.json(photo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.photo.delete({
      where: { id }
    });

    // Sync deletion to Firebase Firestore guestPhotos collection
    try {
      if (db) {
        const docRef = doc(db, 'guestPhotos', id);
        await deleteDoc(docRef);
      }
    } catch (firebaseError) {
      console.error('Failed to delete photo from Firebase:', firebaseError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
