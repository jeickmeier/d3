import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@db/db";
import { organizationType } from "@db/schema";
import { handleApiError, unauthorizedResponse } from "@/lib/api/error-handler";

/**
 * GET handler for fetching all organization types
 *
 * This endpoint retrieves a list of all available organization types
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response containing the list of organization types or an error message
 */
export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    // Fetch organization types from the database
    const types = await db.select().from(organizationType);

    return NextResponse.json(types);
  } catch (error) {
    return handleApiError(error, "GET /api/organizations/types");
  }
}
