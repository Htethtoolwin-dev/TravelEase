"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Date & Travelers" },
  { id: 2, label: "Traveler Info" },
  { id: 3, label: "Review" },
] as const;

export function BookingStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center justify-between gap-2">
      {STEPS.map((step, index) => {
        const isComplete = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isComplete && !isCurrent && "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="size-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "hidden text-center text-xs sm:block",
                  isCurrent ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <div
                className={cn(
                  "mb-5 hidden h-0.5 flex-1 sm:block",
                  isComplete ? "bg-primary" : "bg-muted",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
