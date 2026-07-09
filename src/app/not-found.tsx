import { ButtonLink } from "@/components/shared/button-link";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-primary text-8xl font-bold">404</p>
      <h1 className="font-heading mt-4 text-2xl font-semibold">Page Not Found</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <ButtonLink href={ROUTES.home} className="mt-8">
        Back to Home
      </ButtonLink>
    </div>
  );
}
