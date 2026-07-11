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

    // Build update payload for MySQL
    const mysqlUpdate: any = {};
    if (data.name !== undefined) mysqlUpdate.name = data.name;
    if (data.guestCount !== undefined) mysqlUpdate.guests = data.guestCount;
    if (data.foodPreference !== undefined) mysqlUpdate.dietary = data.foodPreference;
    if (data.specialNotes !== undefined) mysqlUpdate.message = data.specialNotes;
    if (data.approved !== undefined) mysqlUpdate.approved = data.approved;

    try {
      await prisma.rsvp.update({
        where: { id },
        data: mysqlUpdate
      });
    } catch (dbError) {
      console.error('MySQL RSVP update failed, continuing with Firebase fallback:', dbError);
      mysqlFailed = true;
    }

    // Build update payload for Firestore
    const firestoreUpdate: any = {};
    if (data.name !== undefined) firestoreUpdate.name = data.name;
    if (data.guestCount !== undefined) firestoreUpdate.guests = data.guestCount;
    if (data.foodPreference !== undefined) firestoreUpdate.dietary = data.foodPreference;
    if (data.specialNotes !== undefined) firestoreUpdate.message = data.specialNotes;
    if (data.approved !== undefined) firestoreUpdate.approved = data.approved;

    // Auto backup update to Firebase Firestore
    try {
      if (db) {
        const docRef = doc(db, 'rsvps', id);
        await updateDoc(docRef, firestoreUpdate);
      } else if (mysqlFailed) {
        throw new Error('Firebase is not configured and MySQL is offline');
      }
    } catch (firebaseError: any) {
      console.error('Failed to update RSVP in Firebase:', firebaseError);
      if (mysqlFailed) {
        return NextResponse.json({ error: firebaseError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ id, ...data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let mysqlFailed = false;

    try {
      await prisma.rsvp.delete({
        where: { id }
      });
    } catch (dbError) {
      console.error('MySQL RSVP delete failed, continuing with Firebase fallback:', dbError);
      mysqlFailed = true;
    }

    // Auto backup deletion to Firebase Firestore
    try {
      if (db) {
        const docRef = doc(db, 'rsvps', id);
        await deleteDoc(docRef);
      } else if (mysqlFailed) {
        throw new Error('Firebase is not configured and MySQL is offline');
      }
    } catch (firebaseError: any) {
      console.error('Failed to delete RSVP from Firebase:', firebaseError);
      if (mysqlFailed) {
        return NextResponse.json({ error: firebaseError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
