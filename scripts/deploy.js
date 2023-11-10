// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
// const hre = require("hardhat");

;
async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    // const orderbook = await ethers.deployContract("Orderbook");
  
    // console.log("Orderbook address:", await orderbook.getAddress());

    // Deploy AssetIssuerToken contract
    const AssetIssuerToken = await ethers.getContractFactory("AssetIssuerToken");
    const initialSupply = 1000000; // Set the initial supply as needed
    const assetIssuerToken = await AssetIssuerToken.deploy("AssetIssuerToken", "AIT", initialSupply);

  
    console.log("Asset Token address:", await assetIssuerToken.getAddress());
  
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });