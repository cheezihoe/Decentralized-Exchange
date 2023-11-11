const { ethers } = require("hardhat"); 
const { expect } = require("chai");
require("@nomicfoundation/hardhat-chai-matchers")
describe ("Orderbook", function () {
    let Orderbook, BaseToken, QuoteToken, orderbook ,baseToken, quoteToken, owner,trader1,trader2;

    beforeEach(async function () {
        Orderbook = await ethers.getContractFactory("Orderbook");
        BaseToken = await ethers.getContractFactory("AssetIssuerToken");
        QuoteToken = await ethers.getContractFactory("AssetIssuerToken");

        orderbook = await Orderbook.deploy();
        baseToken = await BaseToken.deploy("ETHer","ETH",100000);
        quoteToken = await QuoteToken.deploy("BTHer","BTH",100000);
      
        [owner,trader1,trader2] = await ethers.getSigners();
 
        let bal = await quoteToken.balanceOf(owner.address);
        console.log(Number(bal));

        await quoteToken.transfer(trader1.address, 1000);
        await baseToken.transfer(trader1.address, 1000);
        await baseToken.transfer(trader2.address, 1000);
        await quoteToken.transfer(trader2.address, 1000);
    })

    describe ("Buy ORders", function () {
        it ("Buy limit order", async function () {

            await quoteToken.connect(trader1).approve(orderbook.target,100);
            console.log("hi")
            console.log(await quoteToken.allowance(trader1.address,orderbook.target))

            await baseToken.connect(trader2).approve(orderbook.target, 100);

            //Place sell order from trader 2
            const result = await orderbook.connect(trader2).sellLimitOrder(10,10,baseToken.target,quoteToken.target);
            //await orderbook.connect(trader2).sellLimitOrder(10,10,baseToken.target,quoteToken.target)

           //const result1 = await result.wait()
           //console.log('result',result1.logs[1].args)
           ////Place buy order from trader 1
            await expect(orderbook.connect(trader1).buyLimitOrder(10,10,baseToken.target,quoteToken.target)).to.emit(orderbook,"TradeMatched").withArgs(0,0,trader1.address,trader2.address,10,10);
            // const test = await orderbook.connect(trader1).buyLimitOrder(10,10,baseToken.target,quoteToken.target);
            // const test1 = await test.wait()
            // console.log(test1.logs)
    
            console.log(await baseToken.balanceOf(trader1.address))
            console.log(await quoteToken.balanceOf(trader1.address))
            console.log(await baseToken.balanceOf(trader2.address))
            console.log(await quoteToken.balanceOf(trader2.address))
        })

        it ("Buy partially filled limit order", async function () {
            await quoteToken.connect(trader1).approve(orderbook.target,200);
            console.log(await quoteToken.allowance(trader1.address,orderbook.target))

            await baseToken.connect(trader2).approve(orderbook.target, 10);

            //Place sell order from trader 2
            await orderbook.connect(trader2).sellLimitOrder(10,5,baseToken.target,quoteToken.target);
            
            //Place buy order from trader 1
            await expect(orderbook.connect(trader1).buyLimitOrder(10,20,baseToken.target,quoteToken.target)).to.emit(orderbook,"TradeMatched").withArgs(0,0,trader1.address,trader2.address,10,5);
            
            console.log(await baseToken.balanceOf(trader1.address))
            console.log(await quoteToken.balanceOf(trader1.address))
            console.log(await baseToken.balanceOf(trader2.address))
            console.log(await quoteToken.balanceOf(trader2.address))
        })
    })

    describe ("sell ORders", function () {
        it ("sell limit order", async function () {
            await baseToken.connect(trader1).approve(orderbook.target,10);
            console.log(await quoteToken.allowance(trader1.address,orderbook.target))

            await quoteToken.connect(trader2).approve(orderbook.target, 100);

            //Place buy order from trader 2
            const test = await orderbook.connect(trader2).buyLimitOrder(10,10,baseToken.target,quoteToken.target);
            const test1 = await test.wait()
            console.log(test1.logs)
            console.log(await orderbook.buyOrders())
            //Place sell order from trader 1
            await expect(orderbook.connect(trader1).sellLimitOrder(10,10,baseToken.target,quoteToken.target)).to.emit(orderbook,"TradeMatched").withArgs(0,0,trader2.address,trader1.address,10,10);
            
            console.log(await baseToken.balanceOf(trader1.address))
            console.log(await quoteToken.balanceOf(trader1.address))
            console.log(await baseToken.balanceOf(trader2.address))
            console.log(await quoteToken.balanceOf(trader2.address))
        })
    

        it ("sell partially limit order", async function () {
            await baseToken.connect(trader1).approve(orderbook.target,20);
            console.log(await quoteToken.allowance(trader1.address,orderbook.target))

            await quoteToken.connect(trader2).approve(orderbook.target, 100);

            //Place buy order from trader 2
            await orderbook.connect(trader2).buyLimitOrder(10,5,baseToken.target,quoteToken.target);


            //Place sell order from trader 1
            await expect(orderbook.connect(trader1).sellLimitOrder(10,20,baseToken.target,quoteToken.target)).to.emit(orderbook,"TradeMatched").withArgs(0,0,trader2.address,trader1.address,10,5);


            console.log(await baseToken.balanceOf(trader1.address))
            console.log(await quoteToken.balanceOf(trader1.address))
            console.log(await baseToken.balanceOf(trader2.address))
            console.log(await quoteToken.balanceOf(trader2.address))
        })
    })

    describe ("Cancel Orders", function () {
        it ("cancel order", async function () {
            await quoteToken.connect(trader1).approve(orderbook.target,100);
            console.log(await quoteToken.allowance(trader1.address,orderbook.target))

            await baseToken.connect(trader2).approve(orderbook.target, 10);

            await orderbook.connect(trader1).buyLimitOrder(10,10,baseToken.target,quoteToken.target);

            await expect(orderbook.connect(trader1).cancelOrders(0,true)).to.emit(orderbook,"OrderCancelled").withArgs(0,trader1.address,true);
            console.log(await baseToken.balanceOf(trader1.address))
            console.log(await quoteToken.balanceOf(trader1.address))
            console.log(await baseToken.balanceOf(trader2.address))
            console.log(await quoteToken.balanceOf(trader2.address))

            
        })
    
    })
})


