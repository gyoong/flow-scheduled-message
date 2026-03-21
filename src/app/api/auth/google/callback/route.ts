import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { exchangeGoogleCode, createSession, getBaseUrl } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const base = getBaseUrl();
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${base}/?error=auth_failed`);
  }

  try {
    const { email } = await exchangeGoogleCode(code);

    if (!email.endsWith("@kolon.com")) {
      return NextResponse.redirect(`${base}/?error=invalid_domain`);
    }

    await db.insert(users).values({ email }).onConflictDoNothing();

    await createSession(email);
    return NextResponse.redirect(base);
  } catch (err) {
    console.error("[auth/callback]", err instanceof Error ? err.message : String(err));
    return NextResponse.redirect(`${base}/?error=auth_failed`);
  }
}
