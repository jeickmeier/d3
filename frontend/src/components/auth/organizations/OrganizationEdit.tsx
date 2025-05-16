"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { logger } from "@/lib/utils/logger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizationTypes } from "@/lib/hooks/useOrganizationTypes";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  typeId?: string;
}

interface OrganizationEditProps {
  organization: Organization;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrganizationEdit({
  organization,
  onClose,
  onUpdate,
}: OrganizationEditProps) {
  const [formData, setFormData] = useState({
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo || "",
    typeId: organization.typeId || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const { organizationTypes } = useOrganizationTypes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Check if any fields have changed
      const hasChanges =
        formData.name !== organization.name ||
        formData.slug !== organization.slug ||
        formData.logo !== (organization.logo || "") ||
        formData.typeId !== (organization.typeId || "");

      logger.info("Form data:", formData);
      logger.info("Original organization:", organization);
      logger.info("Has changes:", hasChanges);

      if (!hasChanges) {
        setError("No changes to save");
        setIsLoading(false);
        return;
      }

      // Only check slug if it has changed
      if (formData.slug !== organization.slug) {
        setIsCheckingSlug(true);
        await checkSlugAvailability();
        setIsCheckingSlug(false);

        if (slugError) {
          setIsLoading(false);
          return;
        }
      }

      // Update the organization
      const data: Record<string, string | null> = {
        name: formData.name, // Always include name
        slug: formData.slug, // Always include slug
      };

      // Handle logo changes
      if (formData.logo !== (organization.logo || "")) {
        data.logo = formData.logo || null;
      }

      // Handle type changes - always include in payload if different from original
      const originalTypeId = organization.typeId || "";
      const newTypeId = formData.typeId || "";
      if (newTypeId !== originalTypeId) {
        data.typeId = newTypeId || null;
      }

      logger.info("Update payload:", { organizationId: organization.id, data });

      const response = await fetch("/api/organizations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: organization.id,
          ...data,
        }),
      });

      if (!response.ok) {
        const json: unknown = await response.json();
        logger.error("Organization update failed:", json);
        let errorMessage = "Failed to update organization";
        if (
          typeof json === "object" &&
          json !== null &&
          "error" in json &&
          typeof (json as Record<string, unknown>).error === "string"
        ) {
          errorMessage = (json as Record<string, string>).error;
        }
        throw new Error(errorMessage);
      }

      // Handle success
      onUpdate();
    } catch (err) {
      logger.error("Error updating organization:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update organization",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear slug error when user changes the slug
    if (name === "slug") {
      setSlugError(null);
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, typeId: value }));
  };

  const checkSlugAvailability = async () => {
    if (!formData.slug) {
      setSlugError("Slug is required");
      return false;
    }

    if (formData.slug === organization.slug) {
      return true; // Slug hasn't changed
    }

    setIsCheckingSlug(true);
    setSlugError(null);

    try {
      // Check the slug by making a request to the auth API
      const response = await fetch(
        `/api/organizations/check-slug?slug=${encodeURIComponent(formData.slug)}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        const json: unknown = await response.json();
        let message = "This slug is already taken. Please choose another.";
        if (
          typeof json === "object" &&
          json !== null &&
          "error" in json &&
          typeof (json as Record<string, unknown>).error === "string"
        ) {
          message = (json as Record<string, string>).error;
        }
        setSlugError(message);
        return false;
      }

      return true; // Slug is available
    } catch (err) {
      logger.error("Error checking slug:", err);
      setSlugError("Error checking slug availability");
      return false;
    } finally {
      setIsCheckingSlug(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Edit Organization</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Team Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Organization Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
          />
          {slugError && <p className="text-red-500 text-sm">{slugError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Organization Type</Label>
          <Select value={formData.typeId} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select organization type" />
            </SelectTrigger>
            <SelectContent>
              {organizationTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Logo URL</Label>
          <Input
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isCheckingSlug || !!slugError}
            className="px-4 py-2"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
