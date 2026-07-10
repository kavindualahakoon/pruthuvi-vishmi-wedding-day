import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/firebase-backup';
import { doc, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rsvps = await prisma.rsvp.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(rsvps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const rsvp = await prisma.rsvp.create({
      data: {
        name: data.name,
        email: data.email,
        attending: data.attending,
        guests: data.guests,
        dietary: data.dietary,
        message: data.message,
      }
    });

    // Auto backup to Firebase Firestore
    try {
      if (db) {
        const docRef = doc(db, 'rsvps', rsvp.id);
        await setDoc(docRef, {
          name: rsvp.name,
          email: rsvp.email,
          attending: rsvp.attending,
          guests: rsvp.guests,
          dietary: rsvp.dietary || null,
          message: rsvp.message || null,
          approved: rsvp.approved,
          createdAt: rsvp.createdAt.toISOString(),
        });
      }
    } catch (firebaseError) {
      console.error('Failed to sync RSVP to Firebase:', firebaseError);
    }

    return NextResponse.json(rsvp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
