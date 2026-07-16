-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";

-- Keep PostGIS objects, including spatial_ref_sys, out of the exposed public
-- schema. Application SQL must reference this schema explicitly.
create schema if not exists gis;
create extension if not exists postgis with schema gis;
grant usage on schema gis to anon, authenticated, service_role;
