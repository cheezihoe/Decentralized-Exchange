// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.0;
//npm install @openzeppelin/contracts
//import "../packages/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "Decentralized-Exchange/packages/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Orderbook {

    struct Order {
        //uint id;
        //address trader;
        uint price;
        uint quantity;
        address token;
    }

    Order[] public buyOrders;
    Order[] public sellOrders;
    // //Map address to buy/sell order
    // mapping(address => Order) buyOrders;
    // mapping(address => Order) sellOrders;
    
    //Place buy limit order
    function buyLimitOrder(uint _price , uint _quantity, address _token) public {
        require (_price > 0 , "Price must be greater than zero");
        require (_quantity > 0, "Quantity must be greater than zero");
        Order memory newOrder = Order(_price, _quantity, _token);
        insertBuyOrder(newOrder);

        //Lock money in this contract
        _token.transferFrom(msg.sender, address(this), _quantity);
    }

    function sellLimitOrder(uint _price , uint _quantity, address _token) public {
        require (_price > 0 , "Price must be greater than zero");
        require (_quantity > 0, "Quantity must be greater than zero");
        sellOrders.push(Order(_price, _quantity, _token));
        
        //Lock money in this contract
        _token.transferFrom(msg.sender, address(this), _quantity);
    }

    function insertBuyOrder(Order memory _newOrder) internal {
        uint length = buyOrders.length;
        buyOrders.push(_newOrder);
        while (length > 0 && (buyOrders[length - 1].price < _newOrder.price)) {
            buyOrders[length] = buyOrders[length - 1];
            length--;
        }
        buyOrders[length] = _newOrder;
    }


}