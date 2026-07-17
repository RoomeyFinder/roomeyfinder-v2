export const MINIMUM_PROFILE_AGE = 18;

export function getDateOfBirthError(value: string, today = new Date()) {
  if (!value) return "Enter your date of birth.";

  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) {
    return "Enter a valid date of birth.";
  }

  const [year, month, day] = parts;
  const birthDate = new Date(year, month - 1, day);
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return "Enter a valid date of birth.";
  }

  if (birthDate > today) {
    return "Your date of birth cannot be in the future.";
  }

  let age = today.getFullYear() - year;
  const birthdayHasNotArrived =
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day);
  if (birthdayHasNotArrived) age -= 1;

  return age < MINIMUM_PROFILE_AGE
    ? `You must be at least ${MINIMUM_PROFILE_AGE} years old to use RoomeyFinder.`
    : "";
}
