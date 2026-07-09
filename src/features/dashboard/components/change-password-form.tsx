"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/profile";

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(data: ChangePasswordInput) {
    const result = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: true,
    });

    if (result.error) {
      toast.error(result.error.message ?? "Failed to change password");
      return;
    }

    toast.success("Password changed successfully!");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p className="text-destructive text-sm">{errors.currentPassword.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
        />
        {errors.newPassword ? (
          <p className="text-destructive text-sm">{errors.newPassword.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Change Password"}
      </Button>
    </form>
  );
}
