import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;

export type ClientUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
  phone?: string | null;
};

export function getUserRole(user: unknown) {
  if (user && typeof user === "object" && "role" in user) {
    return String((user as { role?: string }).role ?? "customer");
  }
  return "customer";
}
