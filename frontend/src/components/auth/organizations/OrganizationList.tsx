"use client";

import { useState, lazy, Suspense } from "react";
import { authClient } from "@/lib/auth/auth-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Users } from "lucide-react";
import { OrganizationUsers } from "./OrganizationUsers";
import {
  useOrganizations,
  OrganizationWithMembership,
} from "@/lib/hooks/useOrganizations";
import {
  useOrganizationTypes,
  OrganizationType,
} from "@/lib/hooks/useOrganizationTypes";

// Define an Organization interface compatible with OrganizationEdit
interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  typeId?: string;
  role?: string;
}

// Attempt to dynamically import the OrganizationEdit component
const OrganizationEditComponent = lazy(() =>
  import("./OrganizationEdit").then((mod) => ({
    default: mod.OrganizationEdit,
  })),
);

export function OrganizationList() {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "users" | "edit">("list");

  // Use our custom hook to fetch organizations
  const {
    data: organizations,
    isPending: isLoading,
    error: orgError,
    refetch,
  } = useOrganizations();

  // Use our custom hook to fetch organization types
  const {
    organizationTypes,
    isLoading: isTypesLoading,
    error: typesError,
  } = useOrganizationTypes();

  // Create a map of typeId to type name for quick lookup
  const typeMap = new Map<string, string>();
  if (organizationTypes) {
    organizationTypes.forEach((type: OrganizationType) => {
      typeMap.set(type.id, type.name);
    });
  }

  const handleDelete = async (orgId: string) => {
    try {
      setIsDeleting(true);
      await authClient.organization.delete({ organizationId: orgId });
      await refetch();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete organization",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewUsers = (orgId: string, orgName: string) => {
    setSelectedOrg({ id: orgId, name: orgName });
    setViewMode("users");
  };

  const handleEditOrg = (org: OrganizationWithMembership) => {
    // Convert null logo to undefined to match Organization interface
    const logo = org.logo === null ? undefined : org.logo;

    setEditingOrg({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo,
      typeId: org.typeId || undefined,
      role: org.userRole || undefined,
    });
    setViewMode("edit");
  };

  const handleCloseUsers = () => {
    setSelectedOrg(null);
    setViewMode("list");
  };

  const handleCloseEdit = () => {
    setEditingOrg(null);
    setViewMode("list");
  };

  const handleOrganizationUpdated = () => {
    void refetch(); // Refresh the list
    setViewMode("list");
    setEditingOrg(null);
  };

  const checkAdminStatus = (org: OrganizationWithMembership) => {
    // Now we have explicit userRole information
    const role = org.userRole;
    const isAdmin = role === "admin" || role === "owner";
    return isAdmin;
  };

  if (isLoading || isTypesLoading) {
    return <div className="flex justify-center p-8">Loading teams...</div>;
  }

  if (orgError || error || typesError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error ||
          (orgError instanceof Error
            ? orgError.message
            : typesError instanceof Error
              ? typesError.message
              : "Failed to fetch data")}
      </div>
    );
  }

  // Render different views based on the current mode
  if (viewMode === "users" && selectedOrg) {
    return (
      <OrganizationUsers
        organizationId={selectedOrg.id}
        organizationName={selectedOrg.name}
        onClose={handleCloseUsers}
      />
    );
  }

  if (viewMode === "edit" && editingOrg) {
    return (
      <Suspense fallback={<div>Loading editor...</div>}>
        <OrganizationEditComponent
          organization={editingOrg}
          onClose={handleCloseEdit}
          onUpdate={handleOrganizationUpdated}
        />
      </Suspense>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Member</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!organizations || organizations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                No organizations found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            organizations.map((org) => {
              const isAdmin = checkAdminStatus(org);
              // Get organization type name using the typeId
              const orgTypeName =
                org.typeId && typeMap.has(org.typeId)
                  ? typeMap.get(org.typeId)
                  : "-";

              return (
                <TableRow key={org.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      {org.logo ? (
                        <AvatarImage src={org.logo} alt={org.name} />
                      ) : (
                        <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{org.slug}</TableCell>
                  <TableCell>{orgTypeName}</TableCell>
                  <TableCell>
                    {org.userRole === "owner"
                      ? "superuser"
                      : org.userRole || "-"}
                  </TableCell>
                  <TableCell>{org.userRole ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewUsers(org.id, org.name)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Users
                    </Button>

                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOrg(org)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Organization
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the organization
                                &ldquo;{org.name}&rdquo;? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => void handleDelete(org.id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
