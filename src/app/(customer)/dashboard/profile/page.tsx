import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/features/dashboard/components/profile-form";
import { requireAuth } from "@/lib/session";
import { getUserById } from "@/services/users.service";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = await getUserById(session.user.id);

  if (!user) {
    return <p className="text-muted-foreground">User not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Update your personal information and avatar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            name={user.name}
            email={user.email}
            phone={user.phone}
            image={user.image}
          />
        </CardContent>
      </Card>
    </div>
  );
}
