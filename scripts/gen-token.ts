import { createSessionToken, verifySessionToken } from "../src/lib/auth";

async function main() {
  const token = await createSessionToken({ sub: "test-id", username: "admin" });
  const verified = await verifySessionToken(token);
  console.log("roundtrip ok:", verified?.username === "admin");
  console.log("TOKEN=" + token);
}

main();
