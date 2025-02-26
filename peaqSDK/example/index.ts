import { config } from "dotenv";
import { createDid, deploySmartAccount, storageData } from "../peaqConnection";
config();

if (
  !process.env.MACHINE_STATION_FACTORY_CONTRACT_ADDRESS ||
  !process.env.CONTRACT_OWNER_PRIVATE_KEY ||
  !process.env.MACHINE_OWNER_PRIVATE_KEY ||
  !process.env.SEED_PHRASE ||
  !process.env.API_KEY ||
  !process.env.PROJECT_API_KEY ||
  !process.env.PEAQ_SERVICE_URL ||
  !process.env.RPC_URL ||
  !process.env.CHAIN_ID
) {
  throw new Error("Environment variables not set");
}

const main = async () => {
  const email = "test@example.com";
  const tag = "TEST-SDK-STORAGE";
  const tags = [tag, "20_TEST-SDK-STORAGE", "30_TEST-SDK-STORAGE"];

  console.log("");
  console.log("Deploying machine smart account...");
  const machineAddress = await deploySmartAccount();
  console.log(`Machine smart account deployed at: ${machineAddress}`);

  console.log("");
  console.log("Adding DID attribute to machine...");
  const didTransactionHash = await createDid(email, tag, machineAddress);
  console.log(`DID created. Transaction hash: ${didTransactionHash}`);

  console.log("");
  console.log("Storing data...");
  const storageTransactionHash = await storageData(email, tag, tags);
  console.log(`Data stored. Transaction hash: ${storageTransactionHash}`);

  console.log("");
  console.log("All tasks completed successfully");
};

main();
