'use strict';


const Token = artifacts.require("./GMBCToken.sol");



contract('Token', function(accounts) {

    function getRoles() {
        return {
            owner1: accounts[1],
            owner2: accounts[2],
            investor1: accounts[3],
            investor2: accounts[4],
            investor3: accounts[5],
            nobody: accounts[6]            
        };
    }

    function ETH(amount) {
        return web3.toWei(amount, 'ether');
    }

    it("ERC20 (Mintable)", async function() {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

        const totalSupply = await token.totalSupply({ from: role.nobody });        
        assert((await token.totalSupply({from: role.nobody})).eq(0));

        await token.mint(role.investor1, ETH(10), {from: role.owner1});
        assert((await token.totalSupply({from: role.nobody})).eq(ETH(10)));
        await token.mint(role.investor2, ETH(12), {from: role.owner1});
        assert((await token.totalSupply({from: role.nobody})).eq(ETH(22)));

        await token.name({from: role.nobody});
        await token.symbol({from: role.nobody});
        await token.decimals({from: role.nobody});

        
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ETH(10));

        await token.transfer(role.investor2, ETH(2), {from: role.investor1});
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ETH(8));
        assert.equal(await token.balanceOf(role.investor2, {from: role.nobody}), ETH(14));

        await token.approve(role.investor2, ETH(3), {from: role.investor1});
        assert.equal(await token.allowance(role.investor1, role.investor2, {from: role.nobody}), ETH(3));
        await token.transferFrom(role.investor1, role.investor3, ETH(2), {from: role.investor2});
        assert.equal(await token.allowance(role.investor1, role.investor2, {from: role.nobody}), ETH(1));
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ETH(6));
        assert.equal(await token.balanceOf(role.investor2, {from: role.nobody}), ETH(14));
        assert.equal(await token.balanceOf(role.investor3, {from: role.nobody}), ETH(2));

        assert((await token.totalSupply({from: role.nobody})).eq(ETH(22)));
    });

    it("Invalid transactions", async function() {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

		let addError;
		try {
	        await token.mint(role.investor1, ETH(0), {from: role.owner1});
	    } catch (error) {
            addError = error;
        }
        assert(!addError);

    });

    it("Ownership", async function () {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

		let addError;
		try {
	        await token.mint(role.investor1, ETH(12), {from: role.investor1});
	    } catch (error) {
            addError = error;
        }
		assert.notEqual(addError, undefined, 'Error must be thrown');

		let addError5;
		try {
	        await token.transferOwnership(role.investor1, {from: role.investor1});
	    } catch (error) {
            addError5 = error;
        }
		assert.notEqual(addError5, undefined, 'Error must be thrown');
    });
});
