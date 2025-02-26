import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sdk } from "../peaqSDK.ts";

Deno.serve(async () => {
  const res = await sdk.machineStationFactory.deploySmartAccount();

  return new Response(JSON.stringify({ hash: res }), {
    headers: { "Content-Type": "application/json" },
  });
});
