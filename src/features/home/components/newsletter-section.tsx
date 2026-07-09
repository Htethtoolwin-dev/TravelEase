"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/actions/contact.actions";
import { newsletterSchema, type NewsletterInput } from "@/schemas/auth";

export function NewsletterSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
  });

  async function onSubmit(data: NewsletterInput) {
    const result = await subscribeNewsletter(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Thanks for subscribing!");
    reset();
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="from-primary/10 to-secondary/10 mx-auto max-w-2xl rounded-3xl border bg-gradient-to-br p-8 text-center md:p-12">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-muted-foreground mt-3">
            Get travel tips, exclusive deals, and destination inspiration delivered
            to your inbox.
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-background flex-1"
              {...register("email")}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
