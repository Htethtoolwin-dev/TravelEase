import { createSupabaseAdmin, StorageBucket } from "./client";

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File | Buffer,
  contentType?: string,
) {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType,
  });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteFile(bucket: StorageBucket, path: string) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
