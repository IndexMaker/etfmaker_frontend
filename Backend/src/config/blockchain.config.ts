import { registerAs } from '@nestjs/config';

export default registerAs('blockchain', () => ({
  ethRpcUrl: process.env.ETH_RPC_URL,
  polygonRpcUrl: process.env.POLYGON_RPC_URL,
  baseRpcUrl: process.env.BASE_RPCURL,
  indexRegistryAddress: process.env.INDEX_REGISTRY_ADDRESS,
  privateKey: process.env.PRIVATE_KEY,
}));