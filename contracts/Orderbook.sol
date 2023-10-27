// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.0;
//npm install @openzeppelin/contracts
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "Decentralized-Exchange/packages/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Orderbook {

    struct Order {
        uint id;
        address wallet;
        uint price;
        uint quantity;
        address baseToken;
        address quoteToken;
    }

    Order[] public buyOrders;
    Order[] public sellOrders;
    
    //Place buy limit order
    function buyLimitOrder(uint _price , uint _quantity, address _baseToken, address _quoteToken) public {
        require (_price > 0 , "Price must be greater than zero");
        require (_quantity > 0, "Quantity must be greater than zero");
        
        uint id = buyOrders.length;
        Order memory newOrder = Order(id,msg.sender,_price, _quantity, _baseToken,_quoteToken);
        insertBuyOrder(newOrder);
        matchBuyOrders(findCorrectBuyOrder(newOrder.id));
  
    }

    function sellLimitOrder(uint _price , uint _quantity, address _baseToken, address _quoteToken) public {
        require (_price > 0 , "Price must be greater than zero");
        require (_quantity > 0, "Quantity must be greater than zero");
        
        //Order id start from 1
        uint id = buyOrders.length + 1;
        insertSellOrder(Order(id,msg.sender,_price, _quantity, _baseToken,_quoteToken));
 
    }

    function matchBuyOrders(uint buyOrderPlacement) internal {
        Order storage buyOrder = buyOrders[buyOrderPlacement];

        for (uint i = 0; i < sellOrders.length; i++){
            Order memory sellOrder = sellOrders[i];
            if (sellOrder.price == buyOrder.price){
                uint minQty = min(sellOrder.quantity, buyOrder.quantity);
                uint tradeValue = minQty * buyOrder.price;

                //Transfer base token from seller to buyer
                IERC20(buyOrder.baseToken).transferFrom(sellOrder.wallet, buyOrder.wallet, minQty);
                
                //Transfer quote token from buyer to seller
                IERC20(buyOrder.quoteToken).transferFrom(buyOrder.wallet, sellOrder.wallet, tradeValue);
                
                //Update Order quantities
                buyOrder.quantity = buyOrder.quantity - minQty;
                sellOrder.quantity = sellOrder.quantity - minQty;

                //Check if Orders Completely Filled
                if (buyOrder.quantity == 0){
                    RemoveBuyOrder(buyOrderPlacement);
                }
            }
        }
        
        
    }

    

    //Insert buy orders to array from highest to lowest price
    function insertBuyOrder(Order memory _newOrder) internal {
        uint length = buyOrders.length;
        buyOrders.push(_newOrder);
        while (length > 0 && (buyOrders[length - 1].price < _newOrder.price)) {
            buyOrders[length] = buyOrders[length - 1];
            length--;
        }
        buyOrders[length] = _newOrder;
    }

    //Insert sell orders to array from lowest to highest price
    function insertSellOrder(Order memory _newOrder) internal {
        uint length = sellOrders.length;
        sellOrders.push(_newOrder);
        while (length > 0 && (sellOrders[length - 1].price > _newOrder.price)) {
            sellOrders[length] = sellOrders[length - 1];
            length--;
        }
        sellOrders[length] = _newOrder;
    }    

    function findCorrectBuyOrder(uint _buyOrderid) internal view returns (uint) {
        for (uint i = 0; i < buyOrders.length; i++){
            if(buyOrders[i].id == _buyOrderid){
                return i;
            }
        }

        revert("Buy Order not found");
    }

    function RemoveBuyOrder(uint index) internal {
        require (index < buyOrders.length, "Invalid Index");
        for (uint i = index; i<buyOrders.length;i++){
            buyOrders[i] = buyOrders[i+1];
        }
        
        buyOrders.pop();

    }
    function min(uint a, uint b) internal pure returns (uint){
        return a < b ? a : b;
    }
}