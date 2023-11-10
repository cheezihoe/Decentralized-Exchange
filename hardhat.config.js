
require("@nomicfoundation/hardhat-toolbox");

const INFURA_API_KEY = "PASTE API KEY HERE";
const SEPOLIA_PRIVATE_KEY = "PASTE PRIVATE KEY HERE";
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
      sepolia: {
        url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
        accounts: [SEPOLIA_PRIVATE_KEY]
      }
    }
  };