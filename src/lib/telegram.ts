const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string;
const TELEGRAM_CHANNEL_ID = import.meta.env.VITE_TELEGRAM_CHANNEL_ID as string;
const API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramUploadResult {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

export async function uploadFileToTelegram(file: File): Promise<TelegramUploadResult> {
  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHANNEL_ID);

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
  const isImage = imageExts.includes(ext);

  if (isImage) {
    formData.append('photo', file);
    formData.append('caption', `#designvault ${file.name}`);
  } else {
    formData.append('document', file);
    formData.append('caption', `#designvault ${file.name}`);
  }

  const endpoint = isImage ? `${API_BASE}/sendPhoto` : `${API_BASE}/sendDocument`;
  const response = await fetch(endpoint, { method: 'POST', body: formData });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.description || 'Telegram upload failed');
  }

  const data = await response.json();
  if (!data.ok) throw new Error(data.description || 'Telegram API error');

  const msg = data.result;
  let fileId: string;

  if (isImage && msg.photo) {
    const photos = msg.photo as Array<{ file_id: string; file_size?: number }>;
    fileId = photos[photos.length - 1].file_id;
  } else if (msg.document) {
    fileId = msg.document.file_id;
  } else {
    throw new Error('Could not extract file_id from Telegram response');
  }

  return { file_id: fileId, file_name: file.name, file_size: file.size, file_type: ext };
}

export async function getDownloadUrl(fileId: string): Promise<string> {
  const response = await fetch(`${API_BASE}/getFile?file_id=${fileId}`);
  const data = await response.json();
  if (!data.ok) throw new Error(data.description || 'Failed to get file info');
  return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
}

export function isTelegramConfigured(): boolean {
  return !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHANNEL_ID &&
    TELEGRAM_BOT_TOKEN !== 'your_bot_token_here' &&
    TELEGRAM_CHANNEL_ID !== 'your_channel_id_here');
}
