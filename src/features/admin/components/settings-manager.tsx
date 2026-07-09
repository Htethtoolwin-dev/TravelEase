"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveSiteContact, saveSiteStats } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface SettingsManagerProps {
  stats: {
    happyCustomers: number;
    toursCompleted: number;
    destinations: number;
    yearsExperience: number;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}

export function SettingsManager({ stats, contact }: SettingsManagerProps) {
  const router = useRouter();
  const [statsForm, setStatsForm] = useState(stats);
  const [contactForm, setContactForm] = useState(contact);
  const [isPending, startTransition] = useTransition();

  function saveStats() {
    startTransition(async () => {
      const result = await saveSiteStats(statsForm);
      if (!result.success) toast.error(result.error);
      else { toast.success("Stats updated"); router.refresh(); }
    });
  }

  function saveContact() {
    startTransition(async () => {
      const result = await saveSiteContact(contactForm);
      if (!result.success) toast.error(result.error);
      else { toast.success("Contact info updated"); router.refresh(); }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" description="Site configuration" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Homepage Stats</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {(["happyCustomers", "toursCompleted", "destinations", "yearsExperience"] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                  <Input type="number" value={statsForm[key]} onChange={(e) => setStatsForm({ ...statsForm, [key]: Number(e.target.value) })} />
                </div>
              ))}
            </div>
            <Button onClick={saveStats} disabled={isPending}>{isPending ? "Saving..." : "Save Stats"}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Email</Label><Input value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Address</Label><Input value={contactForm.address} onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })} /></div>
            <Button onClick={saveContact} disabled={isPending}>{isPending ? "Saving..." : "Save Contact"}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
