-- ============================================================
-- STORAGE OBJECT POLICIES
-- ============================================================

create policy "Public can view profile and home photos"

on storage.objects

for select

to anon, authenticated

using (
  bucket_id in ('profile-photos', 'home-photos')
);


create policy "Users can upload photos to their own folder"

on storage.objects

for insert

to authenticated

with check (
  bucket_id in ('profile-photos', 'home-photos')
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);


create policy "Users can delete photos from their own folder"

on storage.objects

for delete

to authenticated

using (
  bucket_id in ('profile-photos', 'home-photos')
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
