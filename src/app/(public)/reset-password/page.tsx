import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <>
      <PageHero
        title="Reset Password"
        description="Enter your new password below."
      />
      <div className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground text-center">
          Password reset functionality will be available once you follow the link
          from your email.
        </p>
      </div>
    </>
  );
}
