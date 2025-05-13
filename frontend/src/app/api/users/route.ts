import { NextRequest, NextResponse } from "next/server";
import { db } from "@db/db";
import { user } from "@db/schema";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/utils/logger";

/**
 * GET handler for fetching all users
 *
 * This endpoint retrieves a list of all users from the database.
 * It requires authentication and returns user data including id, name, email, and image.
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response containing the list of users or an error message
 */

export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .orderBy(user.name);

    return NextResponse.json({ users });
  } catch (error) {
    logger.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
