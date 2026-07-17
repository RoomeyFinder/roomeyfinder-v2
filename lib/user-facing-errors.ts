type DatabaseError = {
  code?: string;
  message?: string;
} | null | undefined;

export function getUserFacingDatabaseError(
  error: DatabaseError,
  fallback: string,
) {
  if (!error) return fallback;

  if (
    error.code === "23514" &&
    error.message?.includes("profile_private_date_of_birth_check")
  ) {
    return "You must be at least 18 years old to create a profile.";
  }

  return error.message || fallback;
}
