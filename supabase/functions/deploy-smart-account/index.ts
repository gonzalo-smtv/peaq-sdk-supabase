import { deploySmartAccount } from "../../../peaqSDK/peaqConnection";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  try {
    const deployedAddress = await deploySmartAccount();

    return new Response(JSON.stringify({ success: true, deployedAddress }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
