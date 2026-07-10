import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    return NextResponse.json(rsvp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
