import { createDid } from "../../../peaqSDK/peaqConnection";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  try {
    const { email, tag, didAddress } = await req.json();
    const txHash = await createDid(email, tag, didAddress);

    return new Response(JSON.stringify({ success: true, txHash }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
