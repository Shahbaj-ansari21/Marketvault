import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Try env secret first, fallback to hardcoded for this deployment
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "8919529918:AAHl9z6TXyxNpvC5IPEygVvmgKwgA0yyAXg";
    const CHANNEL_ID = Deno.env.get("TELEGRAM_CHANNEL_ID") || "-1003831763314";

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const imageExts = ["png", "jpg", "jpeg", "gif", "webp"];
    const isImage = imageExts.includes(ext);

    const tgForm = new FormData();
    tgForm.append("chat_id", CHANNEL_ID);
    tgForm.append("caption", `#marketvault ${file.name}`);

    if (isImage) {
      tgForm.append("photo", file);
    } else {
      tgForm.append("document", file);
    }

    const endpoint = isImage
      ? `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`
      : `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;

    const tgRes = await fetch(endpoint, { method: "POST", body: tgForm });
    const tgData = await tgRes.json();

    if (!tgData.ok) {
      return new Response(
        JSON.stringify({ error: tgData.description || "Telegram upload failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const msg = tgData.result;
    let fileId: string;

    if (isImage && msg.photo) {
      const photos = msg.photo as Array<{ file_id: string; file_size?: number }>;
      fileId = photos[photos.length - 1].file_id;
    } else if (msg.document) {
      fileId = msg.document.file_id;
    } else {
      return new Response(
        JSON.stringify({ error: "Could not extract file_id from Telegram response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        file_id: fileId,
        file_name: file.name,
        file_size: file.size,
        file_type: ext,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
