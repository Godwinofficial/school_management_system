-- 1. Add column if not exists (initially without unique constraint to avoid issues during update)
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS slug text;

-- 2. Drop unique constraint if it already exists (from previous failed runs)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'schools_slug_key') THEN
    ALTER TABLE public.schools DROP CONSTRAINT schools_slug_key;
  END IF;
END $$;

-- 3. Create or replace the helper function
CREATE OR REPLACE FUNCTION public.generate_slug(name text) RETURNS text AS $$
BEGIN
  -- Simple slugify: lowercase, replace non-alphanum with dash
  RETURN lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- 4. Update slugs with duplicate handling
-- We recalculate slugs for ALL records to ensure consistency and handle duplicates
WITH ranked_schools AS (
    SELECT 
        id, 
        name,
        -- Generate the base slug to group by
        lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g')) as base_slug,
        ROW_NUMBER() OVER (
            PARTITION BY lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g')) 
            ORDER BY id
        ) as rn
    FROM public.schools
)
UPDATE public.schools
SET slug = CASE
    WHEN r.rn > 1 THEN r.base_slug || '-' || r.rn
    ELSE r.base_slug
END
FROM ranked_schools r
WHERE public.schools.id = r.id;

-- 5. Re-add the unique constraint
ALTER TABLE public.schools ADD CONSTRAINT schools_slug_key UNIQUE (slug);

-- 6. Enforce NOT NULL
ALTER TABLE public.schools ALTER COLUMN slug SET NOT NULL;
