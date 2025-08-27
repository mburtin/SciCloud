-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', FALSE)
ON CONFLICT (id) DO NOTHING;

-- RLS policies: allow authenticated users to manage objects in this bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated read project documents'
  ) THEN
    CREATE POLICY "Allow authenticated read project documents"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'project-documents' AND auth.role() = 'authenticated');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated upload project documents'
  ) THEN
    CREATE POLICY "Allow authenticated upload project documents"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'project-documents' AND auth.role() = 'authenticated');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated update project documents'
  ) THEN
    CREATE POLICY "Allow authenticated update project documents"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'project-documents' AND auth.role() = 'authenticated');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow authenticated delete project documents'
  ) THEN
    CREATE POLICY "Allow authenticated delete project documents"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'project-documents' AND auth.role() = 'authenticated');
  END IF;
END$$;
