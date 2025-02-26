import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ethers } from "npm:ethers";
import axios from "npm:axios";

const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "executeTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export interface PeaqSDKConfig {
  // Network configuration
  rpcUrl: string;
  chainId: number;
  machineStationFactoryContractAddress: string;

  // Authentication
  ownerPrivateKey: string;

  // Service endpoints and keys
  serviceUrl: string;
  apiKey: string;
  projectApiKey: string;

  // DePIN seed for DID operations
  depinSeed: string;
}

export class PeaqSDK {
  private config: PeaqSDKConfig;
  private provider: ethers.JsonRpcProvider;
  private machineStationFactoryContract: ethers.Contract;
  private ownerAccount: ethers.Wallet;
  private abiCoder: ethers.AbiCoder;

  constructor(config: PeaqSDKConfig) {
    if (!this.isValidConfig(config)) {
      throw new Error("Invalid configuration");
    }

    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.ownerAccount = new ethers.Wallet(
      config.ownerPrivateKey,
      this.provider
    );

    this.machineStationFactoryContract = new ethers.Contract(
      config.machineStationFactoryContractAddress,
      abi,
      this.ownerAccount
    );

    this.abiCoder = new ethers.AbiCoder();
  }

  public storage = {
    storeData: async (params: {
      customTag: string;
      email: string;
      tag: string;
      tags: string[];
    }): Promise<ethers.TransactionReceipt | null> => {
      const { email, tag, tags, customTag } = params;

      const now = new Date().getTime();
      const itemType = customTag + "-" + now;

      // Register item type and tags
      await this.registerItemTypeAndTags({
        item_type: itemType,
        email,
        tag,
        tags: tags,
      });

      // Prepare function call data
      const addItemFunctionSignature = "addItem(bytes,bytes)";
      const addItemFunctionSelector = ethers
        .keccak256(ethers.toUtf8Bytes(addItemFunctionSignature))
        .substring(0, 10);

      const itemTypeHex = ethers.hexlify(ethers.toUtf8Bytes(itemType));
      const item = "TASK-COMPLETED";
      const itemHex = ethers.hexlify(ethers.toUtf8Bytes(item));

      const calldataParams = this.abiCoder.encode(
        ["bytes", "bytes"],
        [itemTypeHex, itemHex]
      );

      const calldata = calldataParams.replace("0x", addItemFunctionSelector);

      try {
        const nonce = this.getRandomNonce();
        const target = "0x0000000000000000000000000000000000000801";

        // Get signature
        const ownerSignature = await this.ownerSignTypedDataExecuteTransaction(
          target,
          calldata,
          nonce
        );

        // Encode the method call data
        const methodData =
          this.machineStationFactoryContract.interface.encodeFunctionData(
            "executeTransaction",
            [target, calldata, nonce, ownerSignature]
          );

        const txResponse = await this.sendTransaction(methodData);
        return await txResponse.wait();
      } catch (error: any) {
        this.handleTransactionError(error);
        throw error;
      }
    },
  };

  // PRIVATE HELPER METHODS

  private isValidConfig(config: PeaqSDKConfig): boolean {
    // TODO: check correct format of config values
    return !!(
      config.rpcUrl &&
      config.chainId &&
      config.machineStationFactoryContractAddress &&
      config.ownerPrivateKey &&
      config.serviceUrl &&
      config.apiKey &&
      config.projectApiKey &&
      config.depinSeed
    );
  }

  private getRandomNonce(): bigint {
    const now = BigInt(Date.now());
    const randomPart = BigInt(Math.floor(Math.random() * 1e18));
    return now * randomPart;
  }

  private handleTransactionError(error: any): void {
    console.error("Transaction failed ");

    // Check if the error is a revert error with data
    if (error.data) {
      console.error("Try to decode error data");
      try {
        // Decode the revert error using the machineStationFactoryContract's ABI
        const iface = new ethers.Interface(
          this.machineStationFactoryContract.interface.fragments
        );
        const decodedError = iface.parseError(error.data);

        console.log("Decoded Error:", decodedError);
      } catch (error) {
        console.error("Failed to decode error data");
      }
    }
  }

  private async sendTransaction(
    methodData: string
  ): Promise<ethers.TransactionResponse> {
    const tx = {
      to: this.config.machineStationFactoryContractAddress,
      data: methodData,
    };

    return await this.ownerAccount.sendTransaction(tx);
  }

  private async registerItemTypeAndTags(data: any) {
    try {
      await axios.post(
        `${this.config.serviceUrl}/v1/data/store`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            APIKEY: this.config.apiKey,
            "P-APIKEY": this.config.projectApiKey,
          },
        }
      );
    } catch (error) {
      console.error("Error registering itemType and tags", error);
      throw error;
    }
  }

  private async ownerSignTypedDataExecuteTransaction(
    target: string,
    data: string,
    nonce: bigint
  ): Promise<string> {
    const domain = {
      name: "MachineStationFactory",
      version: "1",
      chainId: this.config.chainId,
      verifyingContract: this.config.machineStationFactoryContractAddress,
    };

    const types = {
      ExecuteTransaction: [
        { name: "target", type: "address" },
        { name: "data", type: "bytes" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const message = {
      target: target,
      data: data,
      nonce: nonce,
    };

    return await this.ownerAccount.signTypedData(domain, types, message);
  }
}

const ENVS: { [key: string]: string } = {
  RPC_URL: Deno.env.get("RPC_URL"),
  CHAIN_ID: Deno.env.get("CHAIN_ID"),
  MACHINE_STATION_FACTORY_CONTRACT_ADDRESS: Deno.env.get(
    "MACHINE_STATION_FACTORY_CONTRACT_ADDRESS"
  ),
  CONTRACT_OWNER_PRIVATE_KEY: Deno.env.get("CONTRACT_OWNER_PRIVATE_KEY"),
  PEAQ_SERVICE_URL: Deno.env.get("PEAQ_SERVICE_URL"),
  API_KEY: Deno.env.get("API_KEY"),
  PROJECT_API_KEY: Deno.env.get("PROJECT_API_KEY"),
  SEED_PHRASE: Deno.env.get("SEED_PHRASE"),
};

Deno.serve(async (req) => {
  const sdk = new PeaqSDK({
    rpcUrl: ENVS.RPC_URL,
    chainId: parseInt(ENVS.CHAIN_ID),
    machineStationFactoryContractAddress:
      ENVS.MACHINE_STATION_FACTORY_CONTRACT_ADDRESS,
    ownerPrivateKey: ENVS.CONTRACT_OWNER_PRIVATE_KEY,
    serviceUrl: ENVS.PEAQ_SERVICE_URL,
    apiKey: ENVS.API_KEY,
    projectApiKey: ENVS.PROJECT_API_KEY,
    depinSeed: ENVS.SEED_PHRASE,
  });

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
