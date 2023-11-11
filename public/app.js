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

        const OrderbookAddress = '0x9fd140a1298ea2E8Fd42F8807476C3ecD3B56dC1';
        const OrderbookContract = new web3Provider.eth.Contract(abiOB,OrderbookAddress);

        const baseContract = new web3Provider.eth.Contract(abiAIT, '0xd1a11f66bBDB8999262aCb694E97A2b34D41f3c7') 
        const quoteContract = new web3Provider.eth.Contract(abiAIT, '0xde465D7dc0eF6aA56F6a1365af89F3AA73BEa586') 
        
  
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
                    data: AITbytecode,
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

            const baseTokenText = document.getElementById('buy-order-base-token').textContent;
            
             try {
                const accounts = await web3Provider.eth.requestAccounts();
                const account = accounts[0];
                const total = Price*quantity;

                // await quoteContract.methods.approve(OrderbookAddress, total).send({ from: account }, (error, transactionHash) => {
                //   if (!error) {
                //     // Transaction successful
                //     console.log('Transaction hash:', transactionHash);
                //   } else {
                //     // Transaction failed
                //     console.error('Transaction error:', error);
                //   }
                // });

                // await quoteContract.methods.allowance(account, OrderbookAddress).call()
                //     .then(allowanceAmount => {
                //       console.log(`Allowance: ${allowanceAmount}`);
                //     })
                //     .catch(error => {
                //       console.error('Error checking allowance:', error);
                //     });

                //const addy = document.getElementById('account-address').textContent
                
                const order = await OrderbookContract.methods.buyLimitOrder(Price,quantity,baseToken,quoteToken);
                const transaction = await order.send({from: account})
                console.log(transaction);
                 
                // OrderbookContract.Traded(function(err, data) {
                //     if (!err)
                //     console.log(data);
                //  }
                // const result1 = await order
                // console.log('result',result1.logs)
                //console.log(OrderbookContract.events.Traded({fromBlock: 0}));
                //OrderbookContract.events.Traded({fromBlock: 0} , (error, event) => { console.log(JSON.stringify(event)); }).on('data', (event) => {console.log("The event is : " + JSON.stringify(event));}).on('error', console.error);
                const subscription = await OrderbookContract.events.Traded()
                console.log(subscription);
                // const results = await OrderbookContract.methods.getBuyArray();
                // console.log (results.logs)
                // console.log(await OrderbookContract.methods.getBuyArray().call())
                console.log(await OrderbookContract.methods.buyOrders(0))
                // const array = await OrderbookContract.methods.getBuyArray();
                console.log(await OrderbookContract.methods.getBuyArray())
                // console.log(array)
                const tableBody = document.querySelector('#buy-order-list');
                const row = tableBody.insertRow();
                const reversedArguments = order.arguments.slice().reverse();
                reversedArguments.forEach(argument => {

                    // Assuming each element in the array is a string
                    const argumentCell = row.insertCell(0);
                    argumentCell.textContent = argument;
                });

                const rows = Array.from(tableBody.querySelectorAll('tr'));
                rows.sort((a, b) => {
                    const priceA = parseFloat(a.cells[0].textContent);
                    const priceB = parseFloat(b.cells[0].textContent);
                    return priceB - priceA;
                });
            
                // Append the sorted rows back to the table
                rows.forEach(row => tableBody.appendChild(row));

            } catch (error) {
                console.error ('Error issuing buy order', error);
            }
        });   

        document.getElementById('place-sell-order-btn').addEventListener('click', async () => {
            // const Price = document.getElementById('sell-order-price').value;
            // const quantity = document.getElementById('sell-order-quantity').value;
            // const baseToken = document.getElementById('sell-order-base-token').value;
            // const quoteToken = document.getElementById('sell-order-quote-token').value;
            try {
                const results = await OrderbookContract.methods.getBuyArray();
                console.log (results)
 
            //    const order = await OrderbookContract.methods.sellLimitOrder(Price,quantity,baseToken,quoteToken)
            //    console.log('Order:', order.arguments); 
  
            //    const tableBody = document.querySelector('#buy-order-list');
            //    const row = tableBody.insertRow();
            //    const reversedArguments = order.arguments.slice().reverse();
            //    reversedArguments.forEach(argument => {

            //        // Assuming each element in the array is a string
            //        const argumentCell = row.insertCell(0);
            //        argumentCell.textContent = argument;
               //});

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

