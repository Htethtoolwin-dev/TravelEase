"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile.actions";
import { AvatarUpload } from "@/features/dashboard/components/avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileSchema, type UpdateProfileInput } from "@/schemas/profile";

interface ProfileFormProps {
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
}

export function ProfileForm({ name, email, phone, image }: ProfileFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name,
      phone: phone ?? "",
    },
  });

  async function onSubmit(data: UpdateProfileInput) {
    const result = await updateProfile(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile updated!");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <AvatarUpload name={name} image={image} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name ? (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} disabled />
          <p className="text-muted-foreground text-xs">Email cannot be changed here</p>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" placeholder="+1 555 000 0000" {...register("phone")} />
          {errors.phone ? (
            <p className="text-destructive text-sm">{errors.phone.message}</p>
          ) : null}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
