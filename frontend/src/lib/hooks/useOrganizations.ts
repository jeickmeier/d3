import { useState, useEffect } from "react";

export interface OrganizationWithMembership {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  typeId: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  isMember: boolean;
  userRole: string | null;
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<
    OrganizationWithMembership[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchOrganizations() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/organizations/list");

      if (!response.ok) {
        // For error responses, try to get meaningful error information
        let errorMsg = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          // If JSON parsing fails, try to get the text
          const errorText = await response.text();
          if (errorText) {
            errorMsg = `${errorMsg} - ${errorText}`;
          }
        }
        throw new Error(errorMsg);
      }

      // For successful responses
      let data;
      try {
        const text = await response.text();

        // Check if the response is empty
        if (!text || text.trim() === "") {
          throw new Error("Empty response received from API");
        }

        data = JSON.parse(text);
      } catch (err) {
        console.error("JSON parsing error:", err);
        throw new Error(
          `Failed to parse API response: ${err instanceof Error ? err.message : "Unknown parsing error"}`,
        );
      }

      setOrganizations(data);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    data: organizations,
    isPending: isLoading,
    error,
    refetch: fetchOrganizations,
  };
}
