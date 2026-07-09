"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { uploadAvatar } from "@/actions/profile.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function AvatarUpload({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);
    setIsUploading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Avatar updated!");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar size="lg" className="size-20">
          <AvatarImage src={image ?? undefined} alt={name} />
          <AvatarFallback className="text-lg">
            {name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute -right-1 -bottom-1 size-8 rounded-full"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          <Camera className="size-3.5" />
        </Button>
      </div>
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-muted-foreground text-sm">
          {isUploading ? "Uploading..." : "JPG, PNG up to 2MB"}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
