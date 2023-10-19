// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.0 <=0.8.10;
//npm install @openzeppelin/contracts
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Orderbook {

    struct Order {
        uint price;
        uint quantity;
        address asset;
    }

    //Map buyers address to buy order
    mapping(address => Order) buyOrders;

    //Place buy limit order
    function buylimitOrder(uint _price , uint _quantity, address _asset) public {
        require (_price > 0 , "Price must be greater than zero");
        require (_quantity > 0, "Quantity must be greater than zero");
        buyOrders[msg.sender] = Order(_price, _quantity, _asset);
        
        //Lock buyers money in this contract
        _asset.transferFrom(msg.sender, address(this), _quantity);
    }
}