-- Adding an enum value must be committed before it can be used by defaults,
-- constraints, or functions. The next migration performs those changes.
alter type public.home_status add value if not exists 'draft' before 'active';
