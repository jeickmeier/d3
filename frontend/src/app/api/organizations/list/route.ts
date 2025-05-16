import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/utils/logger";
import { db } from "@db/db";
import { organization, member } from "@db/schema";
import { eq } from "drizzle-orm";
import { handleApiError, unauthorizedResponse } from "@/lib/api/error-handler";

/**
 * GET handler for fetching all organizations with user membership info
 *
 * Returns all organizations from the database with membership and role data
 * for the currently authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    logger.info("Starting /api/organizations/list GET handler");

    // Check if the user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      logger.warn("No session found in /api/organizations/list");
      return unauthorizedResponse();
    }

    const userId = session.user?.id;

    if (!userId) {
      logger.warn("User ID not found in session for /api/organizations/list");
      return unauthorizedResponse("User ID not found in session");
    }

    logger.info(`Fetching all organizations for user ${userId}`);

    // Get all organizations from the database
    const allOrganizations = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        typeId: organization.typeId,
        createdAt: organization.createdAt,
        metadata: organization.metadata,
      })
      .from(organization);

    logger.info(`Found ${allOrganizations.length} organizations from database`);

    // Get user's memberships
    const userMemberships = await db
      .select({
        organizationId: member.organizationId,
        role: member.role,
      })
      .from(member)
      .where(eq(member.userId, userId));

    logger.info(
      `Found ${userMemberships.length} memberships for user ${userId}`,
    );

    // Create a map of organization IDs to roles for quick lookup
    const membershipMap = new Map<string, string>();
    userMemberships.forEach((membership) => {
      membershipMap.set(membership.organizationId, membership.role);
    });

    // Add membership and role info to each organization
    const enhancedOrgs = allOrganizations.map((org) => {
      const isMember = membershipMap.has(org.id);
      const userRole = isMember ? membershipMap.get(org.id) : null;

      logger.info(
        `Organization ${org.id} (${org.name}) - User is member: ${isMember}, role: ${userRole || "none"}`,
      );

      return {
        ...org,
        isMember,
        userRole,
      };
    });

    logger.info(
      `Returning ${enhancedOrgs.length} organizations with membership and role info`,
    );

    // Log what we're actually returning to help debug
    if (enhancedOrgs.length > 0) {
      logger.info(`Response data sample: ${JSON.stringify(enhancedOrgs[0])}`);
    }

    return NextResponse.json(enhancedOrgs);
  } catch (error) {
    return handleApiError(error, "GET /api/organizations/list");
  }
}
