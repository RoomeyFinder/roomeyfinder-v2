import Link from "next/link";
import { Button } from "./ui/button";

export function AuthButton({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <Button asChild size="sm" variant="default">
      <Link href={isAuthenticated ? "/matches" : "/auth/login"}>
        Find matches
      </Link>
    </Button>
  );
}
