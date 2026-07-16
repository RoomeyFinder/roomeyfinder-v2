import { Database } from "./database"

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

export type Db = Database

/*
|--------------------------------------------------------------------------
| Profiles
|--------------------------------------------------------------------------
*/

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export type NewProfile = Database["public"]["Tables"]["profiles"]["Insert"]

export type UpdateProfile = Database["public"]["Tables"]["profiles"]["Update"]

export type ProfilePrivate =
  Database["public"]["Tables"]["profile_private"]["Row"]

export type UpdateProfilePrivate =
  Database["public"]["Tables"]["profile_private"]["Update"]

/*
|--------------------------------------------------------------------------
| Preferences
|--------------------------------------------------------------------------
*/

export type Preference = Database["public"]["Tables"]["preferences"]["Row"]

export type NewPreference =
  Database["public"]["Tables"]["preferences"]["Insert"]

export type UpdatePreference =
  Database["public"]["Tables"]["preferences"]["Update"]

/*
|--------------------------------------------------------------------------
| Homes
|--------------------------------------------------------------------------
*/

export type Home = Database["public"]["Tables"]["homes"]["Row"]

export type NewHome = Database["public"]["Tables"]["homes"]["Insert"]

export type UpdateHome = Database["public"]["Tables"]["homes"]["Update"]

export type HomeAddress = Database["public"]["Tables"]["home_addresses"]["Row"]

export type UpdateHomeAddress =
  Database["public"]["Tables"]["home_addresses"]["Update"]

/*
|--------------------------------------------------------------------------
| Profile Photos
|--------------------------------------------------------------------------
*/

export type ProfilePhoto = Database["public"]["Tables"]["profile_photos"]["Row"]

export type NewProfilePhoto =
  Database["public"]["Tables"]["profile_photos"]["Insert"]

export type UpdateProfilePhoto =
  Database["public"]["Tables"]["profile_photos"]["Update"]

/*
|--------------------------------------------------------------------------
| Home Photos
|--------------------------------------------------------------------------
*/

export type HomePhoto = Database["public"]["Tables"]["home_photos"]["Row"]

export type NewHomePhoto = Database["public"]["Tables"]["home_photos"]["Insert"]

export type UpdateHomePhoto =
  Database["public"]["Tables"]["home_photos"]["Update"]

/*
|--------------------------------------------------------------------------
| Amenities
|--------------------------------------------------------------------------
*/

export type Amenity = Database["public"]["Tables"]["amenities"]["Row"]

export type NewAmenity = Database["public"]["Tables"]["amenities"]["Insert"]

export type UpdateAmenity = Database["public"]["Tables"]["amenities"]["Update"]

/*
|--------------------------------------------------------------------------
| Home Amenities
|--------------------------------------------------------------------------
*/

export type HomeAmenity = Database["public"]["Tables"]["home_amenities"]["Row"]

export type NewHomeAmenity =
  Database["public"]["Tables"]["home_amenities"]["Insert"]

export type UpdateHomeAmenity =
  Database["public"]["Tables"]["home_amenities"]["Update"]

/*
|--------------------------------------------------------------------------
| Interests
|--------------------------------------------------------------------------
*/

export type Interest = Database["public"]["Tables"]["interests"]["Row"]

export type NewInterest =
  Database["public"]["Tables"]["interests"]["Insert"]

export type UpdateInterest =
  Database["public"]["Tables"]["interests"]["Update"]

/*
|--------------------------------------------------------------------------
| Enums
|--------------------------------------------------------------------------
*/

export type Gender = Database["public"]["Enums"]["gender_type"]

export type Smoking = Database["public"]["Enums"]["smoking_type"]

export type Pets = Database["public"]["Enums"]["pets_type"]

export type HomeStatus = Database["public"]["Enums"]["home_status"]
