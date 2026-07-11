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

    const updateData: any = {};
    if (data.approved !== undefined) updateData.approved = data.approved;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.attending !== undefined) updateData.attending = data.attending;
    
    // Support both DB schema and UI format
    if (data.guests !== undefined) {
      updateData.guests = data.guests;
    } else if (data.guestCount !== undefined) {
      updateData.guests = data.guestCount;
    }
    
    if (data.dietary !== undefined) {
      updateData.dietary = data.dietary;
    } else if (data.foodPreference !== undefined) {
      updateData.dietary = data.foodPreference;
    }
    
    if (data.message !== undefined) {
      updateData.message = data.message;
    } else if (data.specialNotes !== undefined) {
      updateData.message = data.specialNotes;
    }

    try {
      await prisma.rsvp.update({
        where: { id },
        data: updateData
      });
    } catch (dbError) {
      console.error('MySQL RSVP update failed, continuing with Firebase fallback:', dbError);
      mysqlFailed = true;
    }

    // Auto backup update to Firebase Firestore
    try {
      if (db) {
        const docRef = doc(db, 'rsvps', id);
        await updateDoc(docRef, updateData);
      } else if (mysqlFailed) {
        throw new Error('Firebase is not configured and MySQL is offline');
      }
    } catch (firebaseError: any) {
      console.error('Failed to update RSVP in Firebase:', firebaseError);
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
