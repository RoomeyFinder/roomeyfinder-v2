type DatabaseError =
  | {
      code?: string;
      message?: string;
    }
  | null
  | undefined;

export function getUserFacingDatabaseError(error: DatabaseError, fallback: string) {
  if (!error) return fallback;

  if (error.code === "23505" && error.message?.includes("profiles_username_key")) {
    return "That username is already taken. Please choose another one.";
  }

  if (error.code === "23514" && error.message?.includes("profile_private_date_of_birth_check")) {
    return "You must be at least 18 years old to create a profile.";
  }

  if (error.code === "23514" && error.message?.includes("valid_budget")) {
    return "Enter a valid budget range where the minimum is no greater than the maximum.";
  }

  if (error.code === "23514" && error.message?.includes("preferences_valid_move_from")) {
    return "Move-in from must be today or later.";
  }

  if (error.code === "23514" && error.message?.includes("preferences_valid_move_to")) {
    return "Move-in by must be today or later.";
  }

  if (error.code === "23514" && error.message?.includes("preferences_valid_move_window")) {
    return "Move-in from must be on or before move-in by.";
  }

  return error.message || fallback;
}
