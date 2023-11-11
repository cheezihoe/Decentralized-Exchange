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
        //quantity is quantity of base token
        uint quantity;
        bool isFilled;
        bool isbuyOrder;
        address baseToken;
        address quoteToken;
    }

    Order[] public buyOrders;
    Order[] public sellOrders;
    
    event TradeMatched (
        uint buyOrderID,
        uint sellOrderID,
        address buyerWallet,
        address sellerWallet,
        uint price,
        uint quantity
    );

    event OrderCancelled (
        uint OrderId,
        address wallet,
        bool isBuyOrder
    );

    event Traded (
        uint price,
        uint quantity,
        address baseToken,
        address quoteToken
    );

    event Inserted (
        Order order
    );
    //Place buy limit order
    function buyLimitOrder(uint _price , uint _quantity, address _baseToken, address _quoteToken) external {

        require (_price > 0 , "Price must be greater than zero");
        require (_quantity > 0, "Quantity must be greater than zero");

        //uint orderValue = _price * _quantity;

        //require(IERC20(_quoteToken).allowance(msg.sender, address(this)) >= orderValue, "Allowance not enough");
        uint id = buyOrders.length;
        Order memory newOrder = Order(id,msg.sender,_price, _quantity, false,true, _baseToken,_quoteToken);
        insertBuyOrder(newOrder);
        matchBuyOrders(findCorrectBuyOrder(newOrder.id));
        emit Traded(_price,_quantity,_baseToken,_quoteToken);

        
  
    }

    function sellLimitOrder(uint _price , uint _quantity, address _baseToken, address _quoteToken) external {
        require (_price > 0 , "Price must be greater than zero");
        require (_quantity > 0, "Quantity must be greater than zero");

        //require(IERC20(_baseToken).allowance(msg.sender, address(this)) >= _quantity, "Allowance not enough");

        uint id = sellOrders.length;
        Order memory newOrder = Order(id,msg.sender,_price, _quantity, false,false, _baseToken,_quoteToken);
        insertSellOrder(newOrder);
        matchSellOrders(findCorrectSellOrder(newOrder.id));
  
        emit Traded(_price,_quantity,_baseToken,_quoteToken);
    }

    function matchBuyOrders(uint buyOrderPlacement) internal {
        Order storage buyOrder = buyOrders[buyOrderPlacement];

        for (uint i = 0; i < sellOrders.length && !buyOrder.isFilled; i++){
            Order storage sellOrder = sellOrders[i];
            if ((sellOrder.price <= buyOrder.price) && !sellOrder.isFilled){
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
                    buyOrder.isFilled = true;
                }

                if (sellOrder.quantity == 0){
                    sellOrder.isFilled = true;
                }

                emit TradeMatched(buyOrder.id, sellOrder.id, buyOrder.wallet, sellOrder.wallet, buyOrder.price, minQty);
            }
        }
        
        
    }

    function matchSellOrders(uint sellorderPlacement) internal {
        Order storage sellOrder = sellOrders[sellorderPlacement];

        for (uint i = 0; i < buyOrders.length && !sellOrder.isFilled; i++){
            Order storage buyOrder = buyOrders[i];
            if ((buyOrder.price >= sellOrder.price) && !buyOrder.isFilled){
                uint minQty = min(sellOrder.quantity, buyOrder.quantity);
                uint tradeValue = minQty * sellOrder.price;

                //Transfer quote token from buyer to seller
                IERC20(sellOrder.quoteToken).transferFrom(buyOrder.wallet, sellOrder.wallet, tradeValue);

                //Transfer base token from seller to buyer
                IERC20(sellOrder.baseToken).transferFrom(sellOrder.wallet, buyOrder.wallet, minQty);
                
                //Update Order quantities
                buyOrder.quantity = buyOrder.quantity - minQty;
                sellOrder.quantity = sellOrder.quantity - minQty;

                //Check if Orders Completely Filled
                if (sellOrder.quantity == 0){
                    sellOrder.isFilled = true;
                }

                if (buyOrder.quantity == 0){
                    buyOrder.isFilled = true;
                }

                emit TradeMatched(buyOrder.id, sellOrder.id, buyOrder.wallet, sellOrder.wallet, buyOrder.price, minQty);

            }
        }

        
    }

    //Allows users to cancel order
    function cancelOrders (uint orderid, bool isbuyOrder) external {
        Order storage order;
        if (isbuyOrder == true) {
            order = buyOrders[findCorrectBuyOrder(orderid)];

        } else {
            order = sellOrders[findCorrectSellOrder(orderid)];
        }

        require (order.wallet == msg.sender, "Not trader");
        order.isFilled = true;
        
        emit OrderCancelled(orderid, msg.sender, isbuyOrder);

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
        emit Inserted (_newOrder);
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
        emit Inserted (_newOrder);
    }    

    function findCorrectBuyOrder(uint _buyOrderid) internal view returns (uint) {
        require(_buyOrderid < buyOrders.length, "Buy Order id out of range");
        for (uint i = 0; i < buyOrders.length; i++){
            if(buyOrders[i].id == _buyOrderid){
                return i;
            }
        }
        revert("Buy Order not found");

    }

    function findCorrectSellOrder(uint _sellOrderid) internal view returns (uint) {
        require(_sellOrderid < sellOrders.length, "Sell Order id out of range");
        for (uint i = 0; i < sellOrders.length; i++){
            if(sellOrders[i].id == _sellOrderid){
                return i;
            }
        }

        revert("Sell Order not found");
    }

    // function RemoveBuyOrder(uint index) internal {
    //     require (index < buyOrders.length, "Invalid Buy Order Index");
    //     for (uint i = index; i<buyOrders.length;i++){
    //         buyOrders[i] = buyOrders[i+1];
    //     }
        
    //     buyOrders.pop();

    // }

    // function RemoveSellOrder(uint index) internal {
    //     require (index < sellOrders.length, "Invalid Sell Order Index");
    //     for (uint i = index; i<sellOrders.length;i++){
    //         sellOrders[i] = sellOrders[i+1];
    //     }
        
    //     sellOrders.pop();

    // }

    function min(uint a, uint b) internal pure returns (uint){
        return a < b ? a : b;
    }

   //function getBuyArray() public view returns (Order[] memory) {
   //    return buyOrders;
   //}
    function getBuyArray(uint index) public view returns (Order memory) {
    return (buyOrders[index]);

    }

    function getBuyArrayLength() public view returns (uint length) {
        return (buyOrders.length);
    }
    // function getsellArray() public view returns (Order[] memory) {
    //     return sellOrders;
    // }
    function getsellArray(uint index) public view returns (Order memory) {
        return (sellOrders[index]);

    }

    function getsellArrayLength() public view returns (uint length) {
        return (sellOrders.length);
    }

}