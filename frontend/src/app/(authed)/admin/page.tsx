"use client";

import { useState } from "react";
import { OrganizationsComponent } from "@/components/auth/organizations/OrganizationsComponent";
import { Users, Settings, Building } from "lucide-react";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("users");

  const menuItems = [
    { id: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { id: "teams", label: "Teams", icon: <Building className="w-5 h-5" /> },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "teams":
        return <OrganizationsComponent />;
      case "users":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">
              User management features coming soon...
            </p>
          </div>
        );
      case "settings":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <p className="text-gray-600">
              Settings configuration coming soon...
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-40 bg-white shadow-md">
        <div className="p-3">
          <h1 className="text-sm font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <nav className="mt-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-3 py-2 text-left text-sm ${
                activeSection === item.id
                  ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">
            {menuItems.find((item) => item.id === activeSection)?.label}
          </h2>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Helper function to check if user has admin role
//function isAdmin(user: { role?: string }) {
//  return user.role === 'admin'
//}
