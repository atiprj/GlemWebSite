import { NextResponse } from "next/server";

import { getContactsContent } from "@/lib/contacts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getContactsContent();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
