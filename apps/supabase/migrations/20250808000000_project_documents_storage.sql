-- Create storage bucket for project documents
insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict (id) do nothing;

-- RLS policies: allow authenticated users to manage objects in this bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow authenticated read project documents'
  ) then
    create policy "Allow authenticated read project documents"
      on storage.objects for select
      using (bucket_id = 'project-documents' and auth.role() = 'authenticated');
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow authenticated upload project documents'
  ) then
    create policy "Allow authenticated upload project documents"
      on storage.objects for insert
      with check (bucket_id = 'project-documents' and auth.role() = 'authenticated');
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow authenticated update project documents'
  ) then
    create policy "Allow authenticated update project documents"
      on storage.objects for update
      using (bucket_id = 'project-documents' and auth.role() = 'authenticated');
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow authenticated delete project documents'
  ) then
    create policy "Allow authenticated delete project documents"
      on storage.objects for delete
      using (bucket_id = 'project-documents' and auth.role() = 'authenticated');
  end if;
end$$;
