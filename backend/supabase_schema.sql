-- ====================================================================
-- YoPharma - Complete Supabase Database Schema
-- Run this in your Supabase SQL Editor to ensure all cache tables exist
-- ====================================================================

-- 1. Drug Interactions Cache
CREATE TABLE IF NOT EXISTS cached_drug_interactions (
  drugs_hash TEXT PRIMARY KEY,
  interactions_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Drug Comparisons Cache
CREATE TABLE IF NOT EXISTS cached_drug_comparisons (
  drug_a TEXT NOT NULL,
  drug_b TEXT NOT NULL,
  comparison_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (drug_a, drug_b)
);

-- 3. Drug Details Cache (Egyptian & International)
CREATE TABLE IF NOT EXISTS cached_drug_details (
  drug_name TEXT PRIMARY KEY,
  details_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Drug Alternatives Cache (Egyptian Market)
CREATE TABLE IF NOT EXISTS cached_drug_alternatives (
  drug_name TEXT PRIMARY KEY,
  alternatives_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Chronic Disease Safety Cache
CREATE TABLE IF NOT EXISTS cached_disease_safety (
  drug_name TEXT NOT NULL,
  disease_name TEXT NOT NULL,
  safety_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (drug_name, disease_name)
);

-- 6. Food & Beverage Interactions Cache (NEW)
CREATE TABLE IF NOT EXISTS cached_food_interactions (
  drug_name TEXT PRIMARY KEY,
  food_interactions_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) with public read/write for seamless caching
ALTER TABLE cached_drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_drug_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_drug_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_drug_alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_disease_safety ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_food_interactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Interactions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public select cached_drug_interactions') THEN
    CREATE POLICY "Public select cached_drug_interactions" ON cached_drug_interactions FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Comparisons policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public select cached_drug_comparisons') THEN
    CREATE POLICY "Public select cached_drug_comparisons" ON cached_drug_comparisons FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Details policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public select cached_drug_details') THEN
    CREATE POLICY "Public select cached_drug_details" ON cached_drug_details FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Alternatives policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public select cached_drug_alternatives') THEN
    CREATE POLICY "Public select cached_drug_alternatives" ON cached_drug_alternatives FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Disease safety policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public select cached_disease_safety') THEN
    CREATE POLICY "Public select cached_disease_safety" ON cached_disease_safety FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Food interactions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public select cached_food_interactions') THEN
    CREATE POLICY "Public select cached_food_interactions" ON cached_food_interactions FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
