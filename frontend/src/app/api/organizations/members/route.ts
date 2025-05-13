import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/utils/logger";
import {
  getOrganizationMembers,
  organizationExists,
  hasAdminPermissions,
} from "@/lib/db/organization";
import { db } from "@db/db";
import { member } from "@db/schema";
import { and, eq } from "drizzle-orm";

/**
 * GET handler for fetching all members of an organization
 *
 * This endpoint retrieves a list of all members of an organization.
 * It requires authentication and that the user is a member of the organization.
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response containing the list of members or an error message
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

    // Get the organization ID from the URL
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    // Check if the organization exists
    const exists = await organizationExists(organizationId);
    if (!exists) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Get the organization members using direct DB access
    const members = await getOrganizationMembers(organizationId);

    // Include the current user ID in the response
    const currentUserId = session.user?.id || null;

    return NextResponse.json({
      members,
      currentUserId,
    });
  } catch (error) {
    logger.error("Error fetching organization members:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization members" },
      { status: 500 },
    );
  }
}

/**
 * POST handler for adding a member to an organization
 *
 * This endpoint adds a user to an organization with a specific role.
 * It requires authentication and that the user making the request is an admin or owner of the organization.
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response with success status or an error message
 */
export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    const { userId, organizationId, role } = body;

    if (!userId || !organizationId || !role) {
      return NextResponse.json(
        { error: "User ID, organization ID, and role are required" },
        { status: 400 },
      );
    }

    // Check if the user has admin permissions for this organization
    const currentUserId = session.user?.id;
    if (!currentUserId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 },
      );
    }

    try {
      const hasPermission = await hasAdminPermissions(
        currentUserId,
        organizationId,
      );

      if (!hasPermission) {
        return NextResponse.json(
          {
            error:
              "Forbidden: You need admin or owner permissions to add members to this organization",
          },
          { status: 403 },
        );
      }
    } catch (err) {
      logger.error("Error checking permissions:", err);
      return NextResponse.json(
        { error: "Failed to verify permissions" },
        { status: 500 },
      );
    }

    // Add the member to the organization using auth client
    await auth.api.addMember({
      headers: request.headers,
      body: {
        userId,
        organizationId,
        role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error adding member to organization:", error);
    return NextResponse.json(
      { error: "Failed to add member to organization" },
      { status: 500 },
    );
  }
}

/**
 * PUT handler for updating a member's role in an organization
 *
 * This endpoint updates a member's role in an organization.
 * It requires authentication and that the user making the request is an admin or owner of the organization.
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response with success status or an error message
 */
export async function PUT(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    const { userId, organizationId, role } = body;

    if (!userId || !organizationId || !role) {
      return NextResponse.json(
        { error: "User ID, organization ID, and role are required" },
        { status: 400 },
      );
    }

    // Check if the user has admin permissions for this organization
    const currentUserId = session.user?.id;
    if (!currentUserId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 },
      );
    }

    try {
      const hasPermission = await hasAdminPermissions(
        currentUserId,
        organizationId,
      );

      if (!hasPermission) {
        return NextResponse.json(
          {
            error:
              "Forbidden: You need admin or owner permissions to update member roles in this organization",
          },
          { status: 403 },
        );
      }
    } catch (err) {
      logger.error("Error checking permissions:", err);
      return NextResponse.json(
        { error: "Failed to verify permissions" },
        { status: 500 },
      );
    }

    // First, check if the organization exists
    const exists = await organizationExists(organizationId);
    if (!exists) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    try {
      // Get the membership record directly from the database
      const membership = await db.query.member.findFirst({
        where: and(
          eq(member.userId, userId),
          eq(member.organizationId, organizationId),
        ),
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Member not found in this organization" },
          { status: 404 },
        );
      }

      // Update the role directly in the database
      await db
        .update(member)
        .set({ role })
        .where(
          and(
            eq(member.userId, userId),
            eq(member.organizationId, organizationId),
          ),
        );

      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error("Error updating member role:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: `Failed to update member role: ${errorMessage}` },
        { status: 500 },
      );
    }
  } catch (error) {
    logger.error("Error in member role update handler:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 },
    );
  }
}

/**
 * DELETE handler for removing a member from an organization
 *
 * This endpoint removes a user from an organization.
 * It requires authentication and that the user making the request is an admin or owner of the organization.
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response with success status or an error message
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the parameters from the URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: "User ID and organization ID are required" },
        { status: 400 },
      );
    }

    // Check if the user has admin permissions for this organization
    const currentUserId = session.user?.id;
    if (!currentUserId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 },
      );
    }

    try {
      const hasPermission = await hasAdminPermissions(
        currentUserId,
        organizationId,
      );

      if (!hasPermission) {
        return NextResponse.json(
          {
            error:
              "Forbidden: You need admin or owner permissions to remove members from this organization",
          },
          { status: 403 },
        );
      }
    } catch (err) {
      logger.error("Error checking permissions:", err);
      return NextResponse.json(
        { error: "Failed to verify permissions" },
        { status: 500 },
      );
    }

    try {
      // First, verify the organization exists
      const exists = await organizationExists(organizationId);
      if (!exists) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 },
        );
      }

      // Check if the membership exists
      const membership = await db.query.member.findFirst({
        where: and(
          eq(member.userId, userId),
          eq(member.organizationId, organizationId),
        ),
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Member not found in this organization" },
          { status: 404 },
        );
      }

      // Delete the membership record directly from the database
      await db
        .delete(member)
        .where(
          and(
            eq(member.userId, userId),
            eq(member.organizationId, organizationId),
          ),
        );

      logger.info(
        `Successfully removed user ${userId} from organization ${organizationId}`,
      );
      return NextResponse.json({ success: true });
    } catch (err) {
      // Detailed error logging
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("Error in database operation while removing member:", {
        error: errorMessage,
        userId,
        organizationId,
        stack: err instanceof Error ? err.stack : undefined,
      });

      return NextResponse.json(
        { error: `Database error while removing member: ${errorMessage}` },
        { status: 500 },
      );
    }
  } catch (error) {
    logger.error("Error removing member from organization:", error);
    return NextResponse.json(
      { error: "Failed to remove member from organization" },
      { status: 500 },
    );
  }
}
