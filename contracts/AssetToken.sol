// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 ;

// Import the ERC20 token contract from OpenZeppelin Contracts.
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Define a new contract called AssetIssuerToken that inherits from ERC20.
contract AssetIssuerToken is ERC20 {
    // Declare a state variable to store the owner's address.
    address public owner;

    // Constructor function that initializes the token with a name, symbol, and initial supply.
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        // Set the owner as the address that deploys the contract.
        owner = msg.sender;

        // Mint the initial supply of tokens and assign them to the owner.
        _mint(msg.sender, initialSupply);
    }

    // Modifier to restrict functions to be called only by the contract owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Function to mint new tokens and assign them to a specified account.
    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    // Function to burn (destroy) tokens from a specified account.
    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
}

//for testing
contract Token2 is ERC20 {
    // Declare a state variable to store the owner's address.
    address public owner;

    // Constructor function that initializes the token with a name, symbol, and initial supply.
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        // Set the owner as the address that deploys the contract.
        owner = msg.sender;

        // Mint the initial supply of tokens and assign them to the owner.
        _mint(msg.sender, initialSupply);
    }

    // Modifier to restrict functions to be called only by the contract owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Function to mint new tokens and assign them to a specified account.
    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    // Function to burn (destroy) tokens from a specified account.
    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
}