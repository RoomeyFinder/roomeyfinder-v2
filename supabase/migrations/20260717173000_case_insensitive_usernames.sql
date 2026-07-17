-- Usernames are canonicalized to lowercase in the client and must be unique
-- regardless of casing at the database level as well.
create unique index profiles_username_lower_idx
on public.profiles (lower(username))
where username is not null;
