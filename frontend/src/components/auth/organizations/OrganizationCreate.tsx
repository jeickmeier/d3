import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client"; // Adjust import path as needed

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useOrganizationTypes } from "@/lib/hooks/useOrganizationTypes";

interface OrganizationCreateProps {
  onCreated?: () => void;
}

export function OrganizationCreate({ onCreated }: OrganizationCreateProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo: "",
    typeId: "",
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
      // Check if slug is available before creating
      setIsCheckingSlug(true);
      await authClient.organization.checkSlug({
        slug: formData.slug,
      });
      setIsCheckingSlug(false);

      // Create the organization via our API
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          logo: formData.logo || null,
          typeId: formData.typeId || null,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create organization");
      }
      await response.json();

      // Reset form
      setFormData({
        name: "",
        slug: "",
        logo: "",
        typeId: "",
      });

      // Notify parent component that an org was created
      if (onCreated) {
        onCreated();
      }
    } catch (err) {
      if (isCheckingSlug) {
        setSlugError("This slug is already taken. Please choose another.");
        setIsCheckingSlug(false);
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to create organization",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset error when user types in fields
    setError(null);

    // Auto-generate slug from name if name is changed
    if (name === "name" && !formData.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]/g, "-");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, typeId: value }));
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name">Team Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="My Team"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Team Slug</Label>
          <Input
            id="slug"
            name="slug"
            placeholder="my-team"
            value={formData.slug}
            onChange={handleChange}
            required
          />
          {slugError && <p className="text-red-500 text-sm">{slugError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Team Type</Label>
          <Select value={formData.typeId} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select team type" />
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
          <Label htmlFor="logo">Logo URL (optional)</Label>
          <Input
            id="logo"
            name="logo"
            placeholder="https://example.com/logo.png"
            value={formData.logo}
            onChange={handleChange}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || isCheckingSlug || !!slugError}
          variant="default"
          className="w-full"
        >
          {isLoading ? "Creating..." : "Create Team"}
        </Button>
      </form>
    </div>
  );
}
