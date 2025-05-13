import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  handleApiError,
  unauthorizedResponse,
  badRequestResponse,
} from "@/lib/api/error-handler";

/**
 * GET handler for checking if an organization slug is available
 *
 * This endpoint checks if a given slug is available for use.
 * It requires authentication.
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response indicating if the slug is available
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

    // Get the slug from the URL
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return badRequestResponse("Slug is required");
    }

    // Check if the slug is available
    try {
      // Try to get an organization with this slug
      const organizations = await auth.api.listOrganizations({
        headers: request.headers,
      });

      // Check if any organization has this slug
      const slugExists = organizations.some((org) => org.slug === slug);

      if (slugExists) {
        return NextResponse.json(
          { error: "This slug is already taken" },
          { status: 409 }, // Conflict
        );
      }

      // If we get here, the slug is available
      return NextResponse.json({ available: true });
    } catch (err) {
      // If we get an error during the check, report it
      return handleApiError(
        err,
        "Slug check in GET /api/organizations/check-slug",
      );
    }
  } catch (error) {
    return handleApiError(error, "GET /api/organizations/check-slug");
  }
}
