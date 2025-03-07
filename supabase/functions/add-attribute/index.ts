import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sdk } from "../peaqSDK.ts";

Deno.serve(async (req) => {
  const { didAddress, email, tag } = await req.json();

  console.log('ADD_ATTRIBUTE')
  console.log({ didAddress, email, tag })

  try {
  const res = await sdk.identity.addAttribute({
    didAddress,
    email,
    tag,
  });

  // const res = {
  //   hash: "0x123"
  // }

  return new Response(JSON.stringify({ hash: res.hash }), {
    headers: { "Content-Type": "application/json" },
  });
} catch (e) {
  console.error("Error:", e);
  return new Response(e.message, { status: 500 });
}
});

/*
curl -i --location --request POST 'localhost:54321/functions/v1/add-attribute' \
    --header 'Authorization: Bearer TOKEN' \
    --header 'Content-Type: application/json' \
    --data '{"email":"gonzalo@smtv.dev","tag":"TEST","didAddress": "0x"}'
*/