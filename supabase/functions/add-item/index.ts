import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sdk } from "../peaqSDK.ts";

Deno.serve(async (req) => {
  const { email, tag, tags } = await req.json();

  const res = await sdk.storage.storeData({
    customTag: tag,
    email,
    tag,
    tags,
  });

  return new Response(JSON.stringify({ hash: res.hash }), {
    headers: { "Content-Type": "application/json" },
  });
});
