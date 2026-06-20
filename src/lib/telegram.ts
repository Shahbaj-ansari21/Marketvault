const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface TelegramUploadResult {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

// All Telegram API calls go through Supabase Edge Functions to avoid CORS.
// The bot token and channel ID live as server-side secrets — never exposed to the browser.

export async function uploadFileToTelegram(file: File): Promise<TelegramUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${SUPABASE_URL}/functions/v1/telegram-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      // Do NOT set Content-Type — browser sets multipart boundary automatically
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || `Upload failed (${response.status})`);
  }

  return data as TelegramUploadResult;
}

export async function getDownloadUrl(fileId: string): Promise<string> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/telegram-download?file_id=${encodeURIComponent(fileId)}`,
    {
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || `Download URL fetch failed (${response.status})`);
  }

  return data.url as string;
}

export function isTelegramConfigured(): boolean {
  // With edge functions, config is always server-side — just verify Supabase URL is set
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}
