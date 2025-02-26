import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sdk } from "../peaqSDK.ts";

Deno.serve(async (req) => {
  const { didAddress, email, tag } = await req.json();

  const res = await sdk.identity.addAttribute({
    didAddress,
    email,
    tag,
  });

  return new Response(JSON.stringify({ hash: res.hash }), {
    headers: { "Content-Type": "application/json" },
  });
});
