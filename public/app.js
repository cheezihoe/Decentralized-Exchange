window.addEventListener('load', async () => {
    if (window.ethereum) {
        const web3Provider = new Web3(window.ethereum);

        // Load the ABI asynchronously using fetch
        const abiAITResponse = await fetch('/AssetIssuerToken.json');
        const assetIssuerTokenArtifact = await abiAITResponse.json();
        const abiAIT = assetIssuerTokenArtifact.abi;

        const abiOBResponse = await fetch('/Orderbook.json');
        const OrderbookArtifact = await abiOBResponse.json();
        const abiOB = OrderbookArtifact.abi;

        // Load the Bytecode asynchronously
        const AITbytecode = assetIssuerTokenArtifact.bytecode;
        const OBbytecode = OrderbookArtifact.bytecode;

        console.log('ABI:', abiOB);
        console.log('Bytecode:', OBbytecode)

        // Create a contract instance for AssetToken
        const assetTokenContract = new web3Provider.eth.Contract(abiAIT);
        const OrderbookContract = new web3Provider.eth.Contract(abiOB);

        // Add event listener for the "Connect Wallet" button
        document.getElementById('connect-wallet').addEventListener('click', async () => {
            try {
                // Request the user's permission to connect to MetaMask
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3Provider.eth.getAccounts();
                const accountAddress = accounts[0];
                document.getElementById('account-address').textContent = accountAddress;
                console.log('Connected to MetaMask!');
            } catch (error) {
                console.error('Connection to MetaMask failed:', error);
            }
        });

        // Add event listener for the "Issue Asset" button
        document.getElementById('issue-asset').addEventListener('click', async () => {
            const assetName = document.getElementById('asset-name').value;
            const assetSymbol = document.getElementById('asset-symbol').value;
            const initialSupply = document.getElementById('initial-supply').value; // Add an input for initial supply
        
            try {
                const accounts = await web3Provider.eth.requestAccounts();
                const account = accounts[0];
        
                // Deploy a new AssetToken contract
                const deployedToken = await assetTokenContract.deploy({
                    data: bytecode,
                    arguments: [assetName, assetSymbol, initialSupply], // Pass three arguments
                }).send({ from: account });
        
                // Mint new tokens
                await deployedToken.methods.mint(account, initialSupply).send({ from: account });
        
                console.log('Asset issued!');
            } catch (error) {
                console.error('Error issuing asset:', error);
            }
        });

         document.getElementById('place-buy-order-btn').addEventListener('click', async () => {
             const Price = document.getElementById('buy-order-price').value;
             const quantity = document.getElementById('buy-order-quantity').value;
             const baseToken = document.getElementById('buy-order-base-token').value;
             const quoteToken = document.getElementById('buy-order-quote-token').value;
             try {
                const order = await OrderbookContract.methods.buyLimitOrder(Price,quantity,baseToken,quoteToken)
                console.log('Order:', order.arguments); 
   
                const tableBody = document.querySelector('#buy-order-list');
                const row = tableBody.insertRow();
                const reversedArguments = order.arguments.slice().reverse();
                reversedArguments.forEach(argument => {

                    // Assuming each element in the array is a string
                    const argumentCell = row.insertCell(0);
                    argumentCell.textContent = argument;
                });

            } catch (error) {
                console.error ('Error issuing buy order', error);
            }
        });   

        // Fetch and display order book data
        // You will need to retrieve and display order book data here
    } else {
        alert('Please install the MetaMask extension for Google Chrome.');
    }
});
