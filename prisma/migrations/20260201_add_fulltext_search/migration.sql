-- PostgreSQL Full-Text Search for Course table

-- 1. Add search_vector column
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

-- 2. Create function to generate search vector (Korean + English support)
CREATE OR REPLACE FUNCTION course_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.instructor, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.category, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger to auto-update search_vector
DROP TRIGGER IF EXISTS course_search_vector_trigger ON "Course";
CREATE TRIGGER course_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description, instructor, category
  ON "Course"
  FOR EACH ROW
  EXECUTE FUNCTION course_search_vector_update();

-- 4. Create GIN index for fast searching
CREATE INDEX IF NOT EXISTS course_search_vector_idx ON "Course" USING GIN (search_vector);

-- 5. Update existing courses with search vector
UPDATE "Course" SET
  search_vector =
    setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(instructor, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(category, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(description, '')), 'C');
