import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/auth";

export async function GET() {
  return NextResponse.redirect(getGoogleAuthUrl());
}
