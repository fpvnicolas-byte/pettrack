import { createClient as createServiceClient } from '@supabase/supabase-js';

const BUCKET = 'atendimentos';

interface UploadResult {
  url: string;
  thumbnailUrl: string | null;
  size: number;
}

export async function uploadAtendimentoMedia(
  atendimentoId: string,
  file: File,
  clinicaId: string
): Promise<UploadResult> {
  // Usa service role para contornar RLS do Storage (upload server-side é seguro)
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const ext = file.name.split('.').pop() || 'jpg';
  // Path: {clinica_id}/{atendimento_id}/{timestamp}.{ext}
  // Essa estrutura é exigida pela RLS policy do Storage
  const filename = `${clinicaId}/${atendimentoId}/${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload original
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Upload falhou: ${error.message}`);

  // URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filename);

  // Thumbnail via Supabase Image Transformations (se habilitado no plano)
  const thumbnailUrl = `${publicUrl}?width=400&quality=80`;

  return {
    url: publicUrl,
    thumbnailUrl,
    size: buffer.length,
  };
}
