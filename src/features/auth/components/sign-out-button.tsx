"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = ROUTES.home;
            },
          },
        })
      }
    >
      Sign Out
    </Button>
  );
}
