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

        const OrderbookAddress = '0x4c0183A75A9E4E2F257ece78C7fb29bf580Ae6E6';
        const OrderbookContract = new web3Provider.eth.Contract(abiOB,OrderbookAddress);

        const baseContract = new web3Provider.eth.Contract(abiAIT, '0xd1a11f66bBDB8999262aCb694E97A2b34D41f3c7') 
        const quoteContract = new web3Provider.eth.Contract(abiAIT, '0xde465D7dc0eF6aA56F6a1365af89F3AA73BEa586') 

        const accounts = await web3Provider.eth.requestAccounts();
        const account = accounts[0];

        // row number for user transactions table
        rowIndex = 1;
        rowIndexSell = 1;
        
  
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

            //const baseTokenText = document.getElementById('buy-order-base-token').textContent;
            
             try {
                const accounts = await web3Provider.eth.requestAccounts();
                const account = accounts[0];
                const total = Price*quantity;

                await quoteContract.methods.approve(OrderbookAddress, total).send({ from: account }, (error, transactionHash) => {
                  if (!error) {
                    // Transaction successful
                    console.log('Transaction hash:', transactionHash);
                  } else {
                    // Transaction failed
                    console.error('Transaction error:', error);
                  }
                });

                await quoteContract.methods.allowance(account, OrderbookAddress).call()
                    .then(allowanceAmount => {
                      console.log(`Allowance: ${allowanceAmount}`);
                    })
                    .catch(error => {
                      console.error('Error checking allowance:', error);
                    });

                //const addy = document.getElementById('account-address').textContent
                
                const buyorder = await OrderbookContract.methods.buyLimitOrder(Price,quantity,baseToken,quoteToken);
                const transaction = await buyorder.send({from: account})
                console.log(transaction);
                
                // console.log(await OrderbookContract.methods.getBuyArray(0).call())
                // console.log(array)
                const tableBody = document.querySelector('#buy-order-list');
                const row = tableBody.insertRow();
                const reversedArguments = buyorder.arguments.slice().reverse();
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

                fetchUserTransactionsBUY(Price,quantity,baseToken,quoteToken);

            } catch (error) {
                console.error ('Error issuing buy order', error);
            }
        });   

        document.getElementById('place-sell-order-btn').addEventListener('click', async () => {
            const Price = document.getElementById('sell-order-price').value;
            const quantity = document.getElementById('sell-order-quantity').value;
            const baseToken = document.getElementById('sell-order-base-token').value;
            const quoteToken = document.getElementById('sell-order-quote-token').value;
            console.log(Price)
            console.log(quantity)
            console.log(baseToken)
            console.log(quoteToken)
            try {
                const accounts = await web3Provider.eth.requestAccounts();
                const account = accounts[0];
                console.log(account)
                const total = Price*quantity;

                // await baseContract.methods.approve(OrderbookAddress, quantity).send({ from: account }, (error, transactionHash) => {
                //   if (!error) {
                //     // Transaction successful
                //     console.log('Transaction hash:', transactionHash);
                //   } else {
                //     // Transaction failed
                //     console.error('Transaction error:', error);
                //   }
                // });

                // await baseContract.methods.allowance(account, OrderbookAddress).call()
                //     .then(allowanceAmount => {
                //       console.log(`Allowance: ${allowanceAmount}`);
                //     })
                //     .catch(error => {
                //       console.error('Error checking allowance:', error);
                //     });

                const sellorder = await OrderbookContract.methods.sellLimitOrder(Price,quantity,baseToken,quoteToken);
                const Transaction = await sellorder.send({from: account})
                console.log(Transaction);
                // console.log(await OrderbookContract.methods.getsellArray(0).call())

                const tableBody = document.querySelector('#sell-order-list');
                const row = tableBody.insertRow();
                const reversedArguments = sellorder.arguments.slice().reverse();
                reversedArguments.forEach(argument => {

                    // Assuming each element in the array is a string
                    const argumentCell = row.insertCell(0);
                    argumentCell.textContent = argument;
                });

                const rows = Array.from(tableBody.querySelectorAll('tr'));
                rows.sort((a, b) => {
                    const priceA = parseFloat(a.cells[0].textContent);
                    const priceB = parseFloat(b.cells[0].textContent);
                    return priceA - priceB;
                });
            
                // Append the sorted rows back to the table
                rows.forEach(row => tableBody.appendChild(row));

                fetchUserTransactionsSELL();


           } catch (error) {
               console.error ('Error issuing sell order', error);
           }
       });
       async function cancelOrder(id, isBuyOrder) {
        try {
            await OrderbookContract.methods.cancelOrders(id, isBuyOrder).send({ from: accounts[0] });
            console.log(`Order with ID ${id} cancelled successfully`);
            // You may want to refresh the user transactions table after cancellation
            // fetchUserTransactions();
            const userTransactionList = document.getElementById('user-transaction-list');
            const rows = userTransactionList.querySelectorAll('tr');
            
            rows.forEach(row => {
                const typeCell = row.cells[6]; // Assuming "Type" column is at index 5
                const idCell = row.cells[0];   // Assuming ID column is at index 0
                const targetId = id-1; // Replace with your specific ID

                if (typeCell.textContent.trim() === 'Buy'&& idCell.textContent.trim() === targetId.toString()) {
                    row.remove();
                }
            });
        } catch (error) {
            console.error(`Error cancelling order with ID ${id}:`, error);
        }
    }
       
       // Function to fetch and populate user transactions
        async function fetchUserTransactionsBUY(price,quant,base,quote) {
            const userTransactionList = document.getElementById('user-transaction-list');
            // userTransactionList.innerHTML = ''; // Clear previous content

            try {
                // Fetch user transactions (both buy and sell orders)
                buyArrayLength = await OrderbookContract.methods.getBuyArrayLength().call();
                console.log(buyArrayLength);
                userTransactions = await OrderbookContract.methods.getBuyArray(0).call();
                console.log(userTransactions);
                // const userTransactions = await OrderbookContract.methods.getSellArray(0).call();
                

                const row = userTransactionList.insertRow();
                // Add cells based on transaction properties (id, price, quantity, etc.)
                row.insertCell(0).textContent = rowIndex;
                rowIndex++;
                row.insertCell(1).textContent = price;
                row.insertCell(2).textContent = quant;
                row.insertCell(3).textContent = base;
                row.insertCell(4).textContent = quote;
                row.insertCell(5).textContent = 'Buy';

                // Add a 'Cancel' button with an event listener to cancel the order
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancel';
                cancelButton.addEventListener('click', () => cancelOrder(rowIndex,true));

                const actionCell = row.insertCell(5);
                actionCell.appendChild(cancelButton);
                


            } catch (error) {
                console.error('Error fetching user transactions:', error);
            }
        }

        async function fetchUserTransactionsSELL() {
            const userTransactionList = document.getElementById('user-transaction-list');
            // userTransactionList.innerHTML = ''; // Clear previous content

            try {
                // Fetch user transactions (both buy and sell orders)
                const buyArrayLength = await OrderbookContract.methods.getSellArrayLength().call();
                console.log(buyArrayLength);
                const userTransactions = await OrderbookContract.methods.getSellArray(buyArrayLength-1).call();
                console.log(userTransactions);
                // const userTransactions = await OrderbookContract.methods.getSellArray(0).call();
                

                const row = userTransactionList.insertRow();
                // Add cells based on transaction properties (id, price, quantity, etc.)
                row.insertCell(0).textContent = rowIndexSell;
                rowIndexSell++;
                row.insertCell(1).textContent = userTransactions.price;
                row.insertCell(2).textContent = userTransactions.quantity;
                row.insertCell(3).textContent = userTransactions.baseToken;
                row.insertCell(4).textContent = userTransactions.quoteToken;
                row.insertCell(5).textContent = 'Sell';

                // Add a 'Cancel' button with an event listener to cancel the order
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancel';
                cancelButton.addEventListener('click', () => cancelOrder(transaction.id,transaction.isisbuyOrder));

                const actionCell = row.insertCell(5);
                actionCell.appendChild(cancelButton);


            } catch (error) {
                console.error('Error fetching user transactions:', error);
            }
        }
        // buyArrayLength = await OrderbookContract.methods.getBuyArrayLength().call();
        // console.log(buyArrayLength);
        // userTransactions = await OrderbookContract.methods.getBuyArray(5).call();
        // console.log(await OrderbookContract.methods.getBuyArray(6).call());

        // Fetch and display order book data
        // fetchUserTransactions();
        // You will need to retrieve and display order book data here
    } else {
        alert('Please install the MetaMask extension for Google Chrome.');
    }
});

