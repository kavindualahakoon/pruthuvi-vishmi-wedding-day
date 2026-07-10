import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/firebase-backup';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const rsvp = await prisma.rsvp.update({
      where: { id },
      data: { approved: data.approved }
    });

    // Auto backup update to Firebase Firestore
    try {
      if (db) {
        const docRef = doc(db, 'rsvps', id);
        await updateDoc(docRef, { approved: data.approved });
      }
    } catch (firebaseError) {
      console.error('Failed to update RSVP in Firebase:', firebaseError);
    }

    return NextResponse.json(rsvp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.rsvp.delete({
      where: { id }
    });

    // Auto backup deletion to Firebase Firestore
    try {
      if (db) {
        const docRef = doc(db, 'rsvps', id);
        await deleteDoc(docRef);
      }
    } catch (firebaseError) {
      console.error('Failed to delete RSVP from Firebase:', firebaseError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
