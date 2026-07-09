"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/actions/contact.actions";
import { contactSchema, type ContactInput } from "@/schemas/auth";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactInput) {
    const result = await submitContact(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Message sent! We'll get back to you soon.");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name ? (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email ? (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" {...register("subject")} />
        {errors.subject ? (
          <p className="text-destructive text-sm">{errors.subject.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} {...register("message")} />
        {errors.message ? (
          <p className="text-destructive text-sm">{errors.message.message}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
