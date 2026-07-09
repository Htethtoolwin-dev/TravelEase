"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { signIn } from "@/lib/auth-client";
import { safeCallbackPath } from "@/lib/utils";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { ROUTES } from "@/constants";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackPath(
    searchParams.get("callbackUrl"),
    ROUTES.dashboard,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    const result = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      toast.error(result.error.message ?? "Failed to sign in");
      return;
    }

    toast.success("Welcome back!");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to your TravelEase account</CardDescription>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href={ROUTES.forgotPassword}
                className="text-primary text-sm hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card text-muted-foreground px-2">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            signIn.social({ provider: "google", callbackURL: callbackUrl })
          }
        >
          Continue with Google
        </Button>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href={ROUTES.register} className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
