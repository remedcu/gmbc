'use strict';


const Token = artifacts.require("./GMBCToken.sol");



contract('Token', function(accounts) {

    function getRoles() {
        return {
            owner1: accounts[1],
            investor1: accounts[2],
            investor2: accounts[3],
            investor3: accounts[4],
            nobody: accounts[5]
        };
    }

    function ETH(amount) {
        return web3.toWei(amount, 'ether');
    }

    it("ERC20", async function() {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

        const totalSupply = await token.totalSupply({ from: role.nobody });

        await token.transfer(role.investor1, ETH(10), {from: role.owner1});
        await token.transfer(role.investor2, ETH(12), {from: role.owner1});

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

        //after all the transfers totalSupply remains the same
        assert((await token.totalSupply({from: role.nobody})).eq(totalSupply));
    });

    /*
    it("lock time", async function() {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

        await token.mint(role.investor1, ETH(10), 2114380800, {from: role.owner1});
        await token.mint(role.investor2, ETH(12), 0, {from: role.owner1});

		let addError;
		try {
		   await token.transfer(role.investor2, ETH(2), {from: role.investor1});
	    } catch (error) {
            addError = error;
        }
		assert.notEqual(addError, undefined, 'Error must be thrown');
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ETH(10));

	    await token.transfer(role.investor1, ETH(5), {from: role.investor2});
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ETH(15));
        assert.equal(await token.balanceOf(role.investor2, {from: role.nobody}), ETH(7));
    });
    

    it("burn", async function() {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

        await token.mint(role.investor1, ETH(10), 2114380800, {from: role.owner1});

        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ETH(10));
	    await token.burn(role.investor1, ETH(6), {from: role.owner1});
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ETH(4));

	    await token.burn(role.investor1, ETH(60), {from: role.owner1});
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ETH(0));
    });
    */

    it("wrong input", async function() {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

		let addError;
		try {
	        await token.mint(role.investor1, ETH(0), 0, {from: role.owner1});
	    } catch (error) {
            addError = error;
        }
        assert.notEqual(addError, undefined, 'Error must be thrown');

		let addError2;
		try {
	        await token.burn(role.investor1, ETH(0), 0, {from: role.owner1});
	    } catch (error) {
            addError2 = error;
        }
		assert.notEqual(addError2, undefined, 'Error must be thrown');
    });

    it("owner access", async function() {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

		let addError;
		try {
	        await token.mint(role.investor1, ETH(12), 0, {from: role.investor1});
	    } catch (error) {
            addError = error;
        }
		assert.notEqual(addError, undefined, 'Error must be thrown');

		let addError2;
		try {
	        await token.burn(role.investor1, ETH(12), 0, {from: role.investor1});
	    } catch (error) {
            addError2 = error;
        }
		assert.notEqual(addError2, undefined, 'Error must be thrown');

		let addError3;
		try {
	        await token.mintTokens([role.investor1], [ETH(12)], 0, {from: role.investor1});
	    } catch (error) {
            addError3 = error;
        }
		assert.notEqual(addError3, undefined, 'Error must be thrown');

		let addError4;
		try {
	        await token.changeCrowdsale(role.investor1, {from: role.investor1});
	    } catch (error) {
            addError4 = error;
        }
		assert.notEqual(addError4, undefined, 'Error must be thrown');

		let addError5;
		try {
	        await token.changeOwner(role.investor1, {from: role.investor1});
	    } catch (error) {
            addError5 = error;
        }
		assert.notEqual(addError5, undefined, 'Error must be thrown');
    });
});
