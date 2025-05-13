import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/utils/logger";
import { hasAdminPermissions } from "@/lib/db/organization";
import { db } from "@db/db";
import { organization, member } from "@db/schema";
import { eq, and } from "drizzle-orm";
import {
  handleApiError,
  unauthorizedResponse,
  badRequestResponse,
  forbiddenResponse,
} from "@/lib/api/error-handler";

/**
 * GET handler for fetching all organizations
 *
 * This endpoint retrieves a list of all organizations from the database
 * that the authenticated user is a member of.
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response containing the list of organizations or an error message
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    const userId = session.user?.id;
    if (!userId) {
      return unauthorizedResponse("User ID not found in session");
    }

    // Get organizations using Drizzle with member join
    const orgs = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        typeId: organization.typeId,
        metadata: organization.metadata,
        createdAt: organization.createdAt,
      })
      .from(organization)
      .innerJoin(
        member,
        and(
          eq(organization.id, member.organizationId),
          eq(member.userId, userId),
        ),
      );

    return NextResponse.json(orgs);
  } catch (error) {
    return handleApiError(error, "GET /api/organizations");
  }
}

/**
 * POST handler for creating a new organization
 *
 * This endpoint creates a new organization and adds the current user
 * as an owner of that organization.
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response with the created organization or an error message
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    const userId = session.user?.id;
    if (!userId) {
      return unauthorizedResponse("User ID not found in session");
    }

    const body = await request.json();
    const { name, slug, logo, typeId } = body;

    if (!name || !slug) {
      return badRequestResponse("Name and slug are required");
    }

    // Create organization using Drizzle
    const [org] = await db
      .insert(organization)
      .values({
        id: crypto.randomUUID(),
        name,
        slug,
        logo: logo || null,
        typeId: typeId || null,
        createdAt: new Date(),
      })
      .returning();

    // Add user as owner
    await db.insert(member).values({
      id: crypto.randomUUID(),
      userId,
      organizationId: org.id,
      role: "owner",
      createdAt: new Date(),
    });

    return NextResponse.json(org);
  } catch (error) {
    return handleApiError(error, "POST /api/organizations");
  }
}

/**
 * PUT handler for updating an organization
 *
 * This endpoint updates an existing organization.
 * It requires that the current user is an admin or owner of the organization.
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response with the updated organization or an error message
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, name, slug, logo, typeId } = body;

    if (!id) {
      return badRequestResponse("Organization ID is required");
    }

    const userId = session.user?.id;
    if (!userId) {
      return unauthorizedResponse("User ID not found in session");
    }

    try {
      const hasPermission = await hasAdminPermissions(userId, id);
      if (!hasPermission) {
        return forbiddenResponse(
          "You need admin or owner permissions to update this organization",
        );
      }
    } catch (err) {
      return handleApiError(
        err,
        "Checking permissions in PUT /api/organizations",
      );
    }

    const updateData: Record<string, string | null> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (logo !== undefined) updateData.logo = logo;
    if (typeId !== undefined) updateData.typeId = typeId;

    logger.info("Updating organization:", { id, updateData });

    const result = await db
      .update(organization)
      .set(updateData)
      .where(eq(organization.id, id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    return handleApiError(error, "PUT /api/organizations");
  }
}

/**
 * DELETE handler for deleting an organization
 *
 * This endpoint deletes an organization by ID.
 * It requires that the current user is an owner of the organization.
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response with success status or an error message
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return badRequestResponse("Organization ID is required");
    }

    const userId = session.user?.id;
    if (!userId) {
      return unauthorizedResponse("User ID not found in session");
    }

    try {
      const hasPermission = await hasAdminPermissions(userId, id);
      if (!hasPermission) {
        return forbiddenResponse(
          "You need admin or owner permissions to delete this organization",
        );
      }
    } catch (err) {
      return handleApiError(
        err,
        "Checking permissions in DELETE /api/organizations",
      );
    }

    // Delete members first due to foreign key constraints
    await db.delete(member).where(eq(member.organizationId, id));

    // Then delete the organization
    await db.delete(organization).where(eq(organization.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "DELETE /api/organizations");
  }
}
