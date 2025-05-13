"use client";

import { useState, useEffect, useCallback } from "react";
import { OrganizationMember } from "@/lib/db/organization";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, Trash2, X } from "lucide-react";
import { OrganizationMemberAdd } from "./OrganizationMemberAdd";
import { logger } from "@/lib/utils/logger";
interface OrganizationUsersProps {
  organizationId: string;
  organizationName: string;
  onClose: () => void;
}

export function OrganizationUsers({
  organizationId,
  organizationName,
  onClose,
}: OrganizationUsersProps) {
  const [users, setUsers] = useState<OrganizationMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteUser, setDeleteUser] = useState<OrganizationMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch organization members using the API endpoint
      const response = await fetch(
        `/api/organizations/members?organizationId=${organizationId}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch organization users",
        );
      }

      const data = await response.json();
      setUsers(data.members);

      // Find the current user's role
      const currentUser = data.members.find(
        (member: OrganizationMember) => member.id === data.currentUserId,
      );

      if (currentUser) {
        setCurrentUserRole(currentUser.role);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch organization users",
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  // Check if the current user has admin privileges
  const hasAdminRights = () => {
    return currentUserRole === "admin" || currentUserRole === "owner";
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleMemberAdded = () => {
    // Refresh the list of members
    fetchUsers();
    setShowAddMember(false);
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      setIsUpdatingRole(true);
      setError(null);

      const response = await fetch("/api/organizations/members", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          organizationId,
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update member role");
      }

      // Refresh the list of members
      fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update member role",
      );
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      setIsDeleting(true);
      setError(null);

      logger.info(
        `Removing user ${userId} from organization ${organizationId}`,
      );

      const response = await fetch(
        `/api/organizations/members?userId=${userId}&organizationId=${organizationId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        logger.error("Member removal failed:", errorData);
        throw new Error(errorData.error || "Failed to remove member");
      }

      // Refresh the list of members
      await fetchUsers();
      setDeleteUser(null);
    } catch (err) {
      logger.error("Error in handleRemoveMember:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove member from organization",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Users in {organizationName}</h2>
        <div className="flex items-center space-x-2">
          {hasAdminRights() && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowAddMember(true)}
            >
              Add Member
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showAddMember && (
        <OrganizationMemberAdd
          organizationId={organizationId}
          onClose={() => setShowAddMember(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}

      <Table>
        <TableCaption>List of users in this organization</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                No users found in this organization.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : (
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="capitalize mr-2">{user.role}</span>
                    {hasAdminRights() && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUpdatingRole}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(user.id, "member")}
                            className={
                              user.role === "member" ? "bg-slate-100" : ""
                            }
                          >
                            Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(user.id, "admin")}
                            className={
                              user.role === "admin" ? "bg-slate-100" : ""
                            }
                          >
                            Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(user.id, "owner")}
                            className={
                              user.role === "owner" ? "bg-slate-100" : ""
                            }
                          >
                            Owner
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {hasAdminRights() && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteUser(user)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteUser?.name} from this
              organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUser && handleRemoveMember(deleteUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
