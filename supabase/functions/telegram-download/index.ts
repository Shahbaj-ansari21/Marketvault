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
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "8919529918:AAHl9z6TXyxNpvC5IPEygVvmgKwgA0yyAXg";

    const url = new URL(req.url);
    const fileId = url.searchParams.get("file_id");

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: "file_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const infoData = await infoRes.json();

    if (!infoData.ok) {
      return new Response(
        JSON.stringify({ error: infoData.description || "Failed to get file info from Telegram" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const filePath = infoData.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    return new Response(
      JSON.stringify({ url: downloadUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
