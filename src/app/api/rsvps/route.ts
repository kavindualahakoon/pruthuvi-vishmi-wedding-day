import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/firebase-backup';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rsvps = await prisma.rsvp.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(rsvps);
  } catch (dbError: any) {
    console.error('MySQL query failed, falling back to Firebase Firestore:', dbError);
    if (db) {
      try {
        const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const rsvps: any[] = [];
        querySnapshot.forEach((docSnap) => {
          rsvps.push({ id: docSnap.id, ...docSnap.data() });
        });
        return NextResponse.json(rsvps);
      } catch (firebaseError: any) {
        console.error('Firebase rsvps retrieval failed:', firebaseError);
        return NextResponse.json({ error: 'Both MySQL and Firebase failed' }, { status: 500 });
      }
    }
    return NextResponse.json({ error: `Database offline: ${dbError.message}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let rsvp: any = null;
    let mysqlFailed = false;

    try {
      rsvp = await prisma.rsvp.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          attending: data.attending,
          guests: data.guests,
          dietary: data.dietary,
          message: data.message,
        }
      });
    } catch (dbError) {
      console.error('MySQL RSVP save failed, trying Firebase fallback:', dbError);
      mysqlFailed = true;
      // Fallback object for UI response if MySQL is down
      rsvp = {
        id: `fb-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        attending: data.attending,
        guests: data.guests,
        dietary: data.dietary || null,
        message: data.message || null,
        approved: false,
        createdAt: new Date(),
      };
    }

    // Auto backup to Firebase Firestore
    try {
      if (db) {
        const docRef = doc(db, 'rsvps', rsvp.id);
        await setDoc(docRef, {
          name: rsvp.name,
          email: rsvp.email,
          phone: rsvp.phone || '',
          attending: rsvp.attending,
          guests: rsvp.guests,
          dietary: rsvp.dietary || null,
          message: rsvp.message || null,
          approved: rsvp.approved || false,
          createdAt: rsvp.createdAt instanceof Date ? rsvp.createdAt.toISOString() : rsvp.createdAt,
        });
      } else if (mysqlFailed) {
        throw new Error('Firebase is not configured and MySQL is offline');
      }
    } catch (firebaseError: any) {
      console.error('Failed to sync RSVP to Firebase:', firebaseError);
      if (mysqlFailed) {
        return NextResponse.json({ error: `RSVP failed: ${firebaseError.message}` }, { status: 500 });
      }
    }

    return NextResponse.json(rsvp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
