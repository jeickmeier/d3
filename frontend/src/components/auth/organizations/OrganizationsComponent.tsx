"use client";

import { OrganizationList } from "@/components/auth/organizations/OrganizationList";
import { OrganizationCreate } from "@/components/auth/organizations/OrganizationCreate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useOrganizations } from "@/lib/hooks/useOrganizations";

export function OrganizationsComponent() {
  const [activeTab, setActiveTab] = useState("list");
  const { refetch } = useOrganizations();

  // If an organization is successfully created, switch back to the list tab
  useEffect(() => {
    const handleOrgCreation = () => {
      // Refetch organizations and switch to list tab
      void refetch();
      setActiveTab("list");
    };

    // Create a global event listener for org creation
    window.addEventListener("organization:created", handleOrgCreation);

    return () => {
      window.removeEventListener("organization:created", handleOrgCreation);
    };
  }, [refetch]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto py-2">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-2">
          <TabsTrigger value="list">View Teams</TabsTrigger>
          <TabsTrigger value="create">Create New Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-2">
          <div className="bg-white rounded-lg shadow-sm p-2">
            <OrganizationList />
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-2">
          <div className="bg-white rounded-lg shadow-sm p-2 justify-start">
            <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
            <OrganizationCreate
              onCreated={() => {
                // Dispatch an event when an org is created
                window.dispatchEvent(new Event("organization:created"));
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
