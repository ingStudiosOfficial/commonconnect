import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const createClient = (request: NextRequest) => {
  const response = NextResponse.next();

  createMiddlewareClient({ req: request, res: response });

  return response;
};