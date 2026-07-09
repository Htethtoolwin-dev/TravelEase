"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/schemas/auth";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: { email: string }) {
    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          redirectTo: "/reset-password",
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        toast.error(error?.message ?? "Failed to send reset email");
        return;
      }

      toast.success("Password reset link sent to your email");
    } catch {
      toast.error("Failed to send reset email");
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
