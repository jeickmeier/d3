import { useState, useEffect } from "react";

export interface OrganizationType {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export function useOrganizationTypes() {
  const [organizationTypes, setOrganizationTypes] = useState<
    OrganizationType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchOrganizationTypes() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/organizations/types");

      if (!response.ok) {
        let errorMsg = `API error: ${response.status}`;
        try {
          const errorData = (await response.json()) as { error?: string };
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMsg = `${errorMsg} - ${errorText}`;
          }
        }
        throw new Error(errorMsg);
      }

      const data = (await response.json()) as OrganizationType[];
      setOrganizationTypes(data);
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchOrganizationTypes();
  }, []);

  const refetch = () => {
    void fetchOrganizationTypes();
  };

  return {
    organizationTypes,
    isLoading,
    error,
    refetch,
  };
}
