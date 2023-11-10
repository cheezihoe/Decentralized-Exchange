# Decentralized-Exchange

## Prerequisities
To deploy, you need to have the following:
1. NodeJS
2. Metamask Extension
3. Infura Account

## Steps to Deploy Smart Contracts
1. Git clone this repository
2. Type `cd Decentralized-Exchange` in the terminal to ensure that your in the project directory
3. Type `npm install` in the terminal to install relevant packages
4. Go to your Infura Account and copy your API key
5. Paste the API key in `hardhat.config.js` where it says `const INFURA_API_KEY =`
6. Go to your Metamask Wallet and copy your private key
7. Paste your Private key in `hardhat.config.js` where it says `const SEPOLIA_PRIVATE_KEY =`
8. Remember to save the file!
9. Run `npx hardhat run scripts/deploy.js --network sepolia` in the terminal
10. The Deployed contract address will be shown in the terminal

## Steps to Running the Web Application
1. `python -m http.server`
2. Open your web browser and navigate to http://localhost:8000



Deploying contracts with the account: 0x6aAAa38f65b63117D2ad0B4a66ab512122AC35Dd <br>
Orderbook address: 0x74d74A82f40d55E74f654B98431b13Da3C0DC0A4