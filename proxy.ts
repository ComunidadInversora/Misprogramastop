import { NextRequest, NextResponse } from "next/server";
import { getExpectedSessionValue, ADMIN_COOKIE_NAME } from "@/lib/auth";

const PUBLIC_PATHS = ["/admin/login", "/api/admin/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PUBLIC_PATHS.includes(pathname)) {
    const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const expected = await getExpectedSessionValue();
    if (!cookie || cookie !== expected) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
