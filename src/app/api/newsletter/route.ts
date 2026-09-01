import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing && !existing.unsubscribedAt) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    await prisma.subscriber.upsert({
      where: { email },
      update: { locale: parsed.data.locale, isConfirmed: true, unsubscribedAt: null },
      create: { email, locale: parsed.data.locale, isConfirmed: true },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
