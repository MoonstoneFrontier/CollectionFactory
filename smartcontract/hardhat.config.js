require("@nomicfoundation/hardhat-toolbox");

const { vars } = require("hardhat/config");

function tryVar(name) {
  try {
    return vars.get(name);
  } catch {
    return null;
  }
}

const INFURA_API_KEY = tryVar("INFURA_API_KEY");
const SEPOLIA_PRIVATE_KEY = tryVar("SEPOLIA_PRIVATE_KEY");

const networks = {
  hardhat: {},
};

if (INFURA_API_KEY && SEPOLIA_PRIVATE_KEY) {
  networks.sepolia = {
    url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    accounts: [SEPOLIA_PRIVATE_KEY],
  };
}

module.exports = {
  solidity: "0.8.28",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks,
};
