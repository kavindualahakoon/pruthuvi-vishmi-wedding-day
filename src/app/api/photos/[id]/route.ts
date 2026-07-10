import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/firebase-backup';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    let mysqlFailed = false;

    try {
      await prisma.photo.update({
        where: { id },
        data: { approved: data.approved }
      });
    } catch (dbError) {
      console.error('MySQL photo update failed, continuing with Firebase fallback:', dbError);
      mysqlFailed = true;
    }

    // Sync update to Firebase Firestore guestPhotos collection
    try {
      if (db) {
        const docRef = doc(db, 'guestPhotos', id);
        await updateDoc(docRef, { approved: data.approved });
      } else if (mysqlFailed) {
        throw new Error('Firebase is not configured and MySQL is offline');
      }
    } catch (firebaseError: any) {
      console.error('Failed to update photo in Firebase:', firebaseError);
      if (mysqlFailed) {
        return NextResponse.json({ error: firebaseError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ id, approved: data.approved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let mysqlFailed = false;

    try {
      await prisma.photo.delete({
        where: { id }
      });
    } catch (dbError) {
      console.error('MySQL photo delete failed, continuing with Firebase fallback:', dbError);
      mysqlFailed = true;
    }

    // Sync deletion to Firebase Firestore guestPhotos collection
    try {
      if (db) {
        const docRef = doc(db, 'guestPhotos', id);
        await deleteDoc(docRef);
      } else if (mysqlFailed) {
        throw new Error('Firebase is not configured and MySQL is offline');
      }
    } catch (firebaseError: any) {
      console.error('Failed to delete photo from Firebase:', firebaseError);
      if (mysqlFailed) {
        return NextResponse.json({ error: firebaseError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
