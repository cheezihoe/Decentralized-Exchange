window.addEventListener('load', async () => {
    if (window.ethereum) {
        const web3Provider = new Web3(window.ethereum);

        // Load the ABI asynchronously using fetch
        const abiResponse = await fetch('/artifacts/contracts/AssetIssuerToken.sol/AssetIssuerToken.json');
        const assetIssuerTokenArtifact = await abiResponse.json();
        const abi = assetIssuerTokenArtifact.abi;

        // Load the Bytecode asynchronously
        const bytecodeResponse = await fetch('/artifacts/contracts/AssetIssuerToken.sol/AssetIssuerToken.json');
        const bytecode = await bytecodeResponse.json();

        console.log('ABI:', abi);
        console.log('Bytecode:', bytecode)

        // // Create a contract instance for AssetToken
        const assetTokenContract = new web3Provider.eth.Contract(abi);

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
            const issueAmount = document.getElementById('issue-amount').value;

            try {
                const accounts = await web3Provider.eth.requestAccounts();
                const account = accounts[0];

                // Deploy a new AssetToken contract
                const deployedToken = await assetTokenContract.deploy({
                    data: assetTokenBytecode,
                    arguments: [assetName, assetSymbol],
                }).send({ from: account });

                // Mint new tokens
                await deployedToken.methods.mint(account, issueAmount).send({ from: account });

                console.log('Asset issued!');
            } catch (error) {
                console.error('Error issuing asset:', error);
            }
        });

        // Fetch and display order book data
        // You will need to retrieve and display order book data here
    } else {
        alert('Please install the MetaMask extension for Google Chrome.');
    }
});
