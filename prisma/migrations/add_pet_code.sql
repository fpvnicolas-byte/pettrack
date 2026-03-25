-- Add pet_code column for unique sequential registration number per clinic
ALTER TABLE pets ADD COLUMN pet_code INTEGER;

-- Backfill existing pets with sequential numbers per clinic
WITH numbered AS (
  SELECT id, clinica_id,
    ROW_NUMBER() OVER (PARTITION BY clinica_id ORDER BY created_at) as rn
  FROM pets
)
UPDATE pets SET pet_code = numbered.rn
FROM numbered WHERE pets.id = numbered.id;

ALTER TABLE pets ALTER COLUMN pet_code SET NOT NULL;
CREATE UNIQUE INDEX pets_pet_code_clinica_id_key ON pets(pet_code, clinica_id);
