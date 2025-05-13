import { db } from "@db/db";
import { member, user, organization } from "@db/schema";
import { eq, and } from "drizzle-orm";

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

/**
 * Get all members of an organization with their user details
 * @param organizationId The ID of the organization
 * @returns Array of organization members with user details
 */
export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  try {
    // Join the member and user tables to get user details for each member
    const members = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: member.role,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, organizationId));

    return members;
  } catch (error) {
    console.error("Error fetching organization members:", error);
    throw new Error("Failed to fetch organization members");
  }
}

/**
 * Check if an organization exists
 * @param organizationId The ID of the organization
 * @returns Boolean indicating if the organization exists
 */
export async function organizationExists(
  organizationId: string,
): Promise<boolean> {
  try {
    const org = await db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

    return org.length > 0;
  } catch (error) {
    console.error("Error checking organization existence:", error);
    throw new Error("Failed to check organization existence");
  }
}

/**
 * Check if a user is a member of an organization
 * @param userId The ID of the user
 * @param organizationId The ID of the organization
 * @returns Boolean indicating if the user is a member
 */
export async function isOrganizationMember(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  try {
    const membership = await db
      .select({ id: member.id })
      .from(member)
      .where(
        and(
          eq(member.userId, userId),
          eq(member.organizationId, organizationId),
        ),
      )
      .limit(1);

    return membership.length > 0;
  } catch (error) {
    console.error("Error checking organization membership:", error);
    throw new Error("Failed to check organization membership");
  }
}

/**
 * Check if a user has admin permissions in an organization (admin or owner role)
 * @param userId The ID of the user
 * @param organizationId The ID of the organization
 * @returns Boolean indicating if the user has admin permissions
 */
export async function hasAdminPermissions(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  try {
    const membership = await db
      .select({ role: member.role })
      .from(member)
      .where(
        and(
          eq(member.userId, userId),
          eq(member.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (membership.length === 0) {
      return false;
    }

    // Check if the user has an admin or owner role
    return ["admin", "owner"].includes(membership[0].role);
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    throw new Error("Failed to check admin permissions");
  }
}
