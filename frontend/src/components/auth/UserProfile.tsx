import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    id: string | null;
  };
  organizations?: Array<{
    id: string;
    name: string;
  }>;
}

export function UserProfile({ user, organizations }: UserProfileProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-start space-x-4">
        <Avatar className="h-20 w-20 rounded-lg">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
          <AvatarFallback className="rounded-lg text-lg">
            {user.name
              ? user.name.split(" ").filter(Boolean)[0]?.[0] || "U"
              : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div>
            <div className="text-sm text-muted-foreground">Name</div>
            <div className="font-medium">{user.name}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">User ID</div>
            <div className="font-medium">{user.id}</div>
          </div>
        </div>
      </div>
      <div>
        <table className="w-full mt-4">
          <thead>
            <tr>
              <th className="text-left py-2 px-4 border-b">Belongs to Teams</th>
            </tr>
          </thead>
          <tbody>
            {organizations?.map((org) => (
              <tr key={org.id}>
                <td className="py-2 px-4 border-b">{org.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
