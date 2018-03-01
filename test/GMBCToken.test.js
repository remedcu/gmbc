'use strict';


const Token = artifacts.require("./TestableGMBCToken.sol");



contract('Token', function(accounts) {

    function getRoles() {
        return {
            owner1: accounts[1],
            owner2: accounts[2],            
            investor1: accounts[3],
            investor2: accounts[4],
            investor3: accounts[5],
            nobody: accounts[6],
            fund: accounts[7],
            crowdsale: accounts[8]
        };
    }

    function GMBC(amount) {
        //only works with 18 decimal tokens
        return web3.toWei(amount, 'ether');
    }

    const rewind = async (duration) => {        
        await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [duration], id: 0})
        await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0})
    }

    async function throwsRevert(test) {
        let catched;
		try {
	        await test;
	    } catch (error) {
            catched = error;
        }
        
        const properException = catched != undefined && catched.message.indexOf(`VM Exception while processing transaction: revert`) > -1
        return properException ? true : catched;
    }

    //truffle develop should be restarted after running this test
    it("GMBC", async function () {        
        const role = getRoles();

        const token = await Token.new({from: role.owner1});        
        
        token.setCrowdsale(role.crowdsale, { from: role.owner1 });

        await token.name({from: role.nobody});
        await token.symbol({from: role.nobody});
        await token.decimals({from: role.nobody});

        const now = (await token.getNow()).toNumber();
        const publicSaleEnd = (await token.publicSaleEnd()).toNumber();

        
        if (now >= publicSaleEnd) {
            console.log('Warning: This test is designed to run before publicSaleEnd, restart your truffle develop server if this is the case');
            assert(false);
        }
        
        assert((await token.totalSupply({ from: role.nobody })).eq(0));

        //test cap
        const cap = await token.cap({ from: role.nobody });
        const invsetors = [role.investor1, role.investor2, role.investor3];
        const gmbsPerTransfer = GMBC(15533300);
        let totalSupply = new web3.BigNumber(gmbsPerTransfer);

        let investorIndex = 0;
        while (totalSupply.lte(cap)) {            
            await token.sendAlias(invsetors[investorIndex], gmbsPerTransfer, 0, { from: role.crowdsale });
            investorIndex = (investorIndex + 1) % invsetors.length;

            assert((await token.totalSupply({ from: role.nobody })).eq(totalSupply));
            totalSupply = totalSupply.plus(gmbsPerTransfer);            
        }

        assert(true === await throwsRevert(token.sendAlias(gmbsPerTransfer, invsetors[investorIndex], 0, { from: role.crowdsale })))

        const left2mint = cap.minus(totalSupply.minus(gmbsPerTransfer));
        await token.mint(invsetors[investorIndex], left2mint, { from: role.owner1 })
        
        
        assert((await token.totalSupply({ from: role.nobody })).eq(cap));
        assert((await token.totalSupply({ from: role.nobody })).eq(GMBC(600000000)));


        assert(true === await throwsRevert(token.transfer(role.investor1, 1, {from: role.investor2})))
        await token.allowance( role.investor1, 1, { from: role.investor2 })
        assert(true === await throwsRevert(token.transferFrom(role.investor2, role.investor1, 1, { from: role.investor1 })))

        assert.isFalse((await token.finalized({from: role.nobody})))
        assert(true === await throwsRevert(token.finalize(role.fund, { from: role.owner1 })))
        assert.isFalse((await token.finalized({from: role.nobody})))

        //before public sale
        await rewind(publicSaleEnd - now + 1);  //1 second more
        //after public sale

        assert(true === await throwsRevert( token.finalize(role.fund, { from: role.nobody }) ))

       
        assert.isFalse((await token.finalized({from: role.nobody})))
        await token.finalize(role.fund, { from: role.owner1 });
        assert.isTrue((await token.finalized({from: role.nobody})))
        
        assert((await token.balanceOf(role.fund)).eq( GMBC(400000000) ));
        assert((await token.totalSupply()).eq( GMBC(1000000000) ));
        
        
        assert(true === await throwsRevert(token.finalize(role.fund, { from: role.owner1 })))
        
        let balance1 = await token.balanceOf(role.investor1);
        let balance2 = await token.balanceOf(role.investor2);
        
        await token.transfer(role.investor1, 1, { from: role.investor2 })

        balance1 = balance1.plus(1);
        balance2 = balance2.minus(1);

        assert((await token.balanceOf(role.investor1)).eq(balance1))
        assert((await token.balanceOf(role.investor2)).eq(balance2))

        await token.approve(role.investor1, 1, { from: role.investor2 })

        assert((await token.allowance(role.investor2, role.investor1)).eq(1));

        await token.transferFrom(role.investor2, role.investor1, 1, { from: role.investor1 })

        balance2 = balance2.minus(1);
        balance1 = balance1.plus(1);

        assert((await token.balanceOf(role.investor1)).eq(balance1))
        assert((await token.balanceOf(role.investor2)).eq(balance2))
    })

});
