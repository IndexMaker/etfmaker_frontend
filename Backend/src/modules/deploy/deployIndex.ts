const { ethers } = require("hardhat");

async function main() {
  
  return
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const pSymmAddress = process.env.PSYMM_ADDRESS; // PSYMM contract address on Base
  const indexRegistryAddress = process.env.INDEX_REGISTRY_ADDRESS; // IndexRegistry contract address on Base
  const collateralToken = process.env.USDC_ADDRESS_IN_BASE; // USDC address on Base
  const collateralTokenPrecision = ethers.utils.parseUnits("1", 6); // 1e6 for USDC
  const mintFee = ethers.utils.parseUnits("1", 17); 
  const burnFee = ethers.utils.parseUnits("1", 17);
  const managementFee = ethers.utils.parseUnits("2", 18); 
  const maxMintPerBlock = ethers.utils.parseUnits("10000", 18); 
  const maxRedeemPerBlock = ethers.utils.parseUnits("10000", 18); 

  // SY100 Configuration
  const sy100Config = {
    name: "SY100",
    symbol: "SY100",
    custodyId: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SY100")),
    weights: [
      { token: "0xToken1", weight: 1000 }, // 10%
      { token: "0xToken2", weight: 500 }, // 5%
      // ... (add more tokens)
    ],
  };

  // SYAZ Configuration
  const syazConfig = {
    name: "SYAZ",
    symbol: "SYAZ",
    custodyId: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SYAZ")),
    weights: [
      { token: "0xTokenA", weight: 200 }, // Equal weight (e.g., 50 tokens = 200 bp each)
      { token: "0xTokenB", weight: 200 },
      // ... (add more tokens)
    ],
  };

  // Deploy SY100
  const PSymmIndex = await ethers.getContractFactory("pSymmIndex");
  const sy100 = await PSymmIndex.deploy(
    pSymmAddress,
    indexRegistryAddress,
    sy100Config.name,
    sy100Config.symbol,
    sy100Config.custodyId,
    collateralToken,
    collateralTokenPrecision,
    mintFee,
    burnFee,
    managementFee,
    maxMintPerBlock,
    maxRedeemPerBlock
  );
  await sy100.deployed();
  console.log("SY100 deployed to:", sy100.address);

  // Register SY100
  const IndexRegistry = await ethers.getContractFactory("IndexRegistry"); // Adjust if different
  const indexRegistry = await IndexRegistry.attach(indexRegistryAddress);
  const sy100Weights = encodeWeights(sy100Config.weights);
  await indexRegistry.registerIndex(1, sy100Config.name, sy100.address, sy100Weights);
  console.log("SY100 registered with ID 1");

  // Deploy SYAZ
  const syaz = await PSymmIndex.deploy(
    pSymmAddress,
    indexRegistryAddress,
    syazConfig.name,
    syazConfig.symbol,
    syazConfig.custodyId,
    collateralToken,
    collateralTokenPrecision,
    mintFee,
    burnFee,
    managementFee,
    maxMintPerBlock,
    maxRedeemPerBlock
  );
  await syaz.deployed();
  console.log("SYAZ deployed to:", syaz.address);

  // Register SYAZ
  const syazWeights = encodeWeights(syazConfig.weights);
  await indexRegistry.registerIndex(2, syazConfig.name, syaz.address, syazWeights);
  console.log("SYAZ registered with ID 2");

  // Example: Update SY100 weights (if already exists)
  const updatedSy100Weights = encodeWeights([
    { token: "0xToken1", weight: 1200 }, // Updated weight
    { token: "0xToken2", weight: 400 },
    // ... (add more tokens)
  ]);
  await indexRegistry.updateIndexWeights(1, updatedSy100Weights);
  console.log("SY100 weights updated");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });