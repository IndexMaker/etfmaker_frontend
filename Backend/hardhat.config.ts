require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ethers');
require('dotenv').config();
const verifierConf = {
  version: '0.8.27',
  settings: {
    optimizer: {
      enabled: true,
      runs: 2000,
    },
  },
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.27',
        settings: {
          viaIR: true,
          optimizer: { enabled: false },
        },
      },
    ],
    overrides: {
      'contracts/src/NoirTest/NoirTest.sol': verifierConf,
    },
  },
  paths: {
    sources: './contracts/src',
    artifacts: './artifacts',
    cache: './cache',
  },
  networks: {
    base: {
      url: process.env.BASE_RPCURL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};