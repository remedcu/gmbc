'use strict';


const Token = artifacts.require("./GMBCToken.sol");



contract('Token', function(accounts) {

    function getRoles() {
        return {
            owner1: accounts[1],
            owner2: accounts[2],
            fund: accounts[3],
            accountant: accounts[4],
            investor1: accounts[5],
            investor2: accounts[6],
            investor3: accounts[7],
            nobody: accounts[8]            
        };
    }

    function GMBC(amount) {
        //only works with 18 decimal tokens
        return web3.toWei(amount, 'ether');
    }

    async function shouldThrow(test) {
        let catched;
		try {
	        await test;
	    } catch (error) {
            catched = error;
        }
        assert.notEqual(catched, undefined, 'Error must be thrown');
    }

    it("ERC20 (Mintable)", async function() {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

        const totalSupply = await token.totalSupply({ from: role.nobody });        
        assert((await token.totalSupply({from: role.nobody})).eq(0));

        await token.mint(role.investor1, GMBC(10), {from: role.owner1});
        assert((await token.totalSupply({from: role.nobody})).eq(GMBC(10)));
        await token.mint(role.investor2, GMBC(12), {from: role.owner1});
        assert((await token.totalSupply({from: role.nobody})).eq(GMBC(22)));

        await token.name({from: role.nobody});
        await token.symbol({from: role.nobody});
        await token.decimals({from: role.nobody});

        
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), GMBC(10));

        await token.transfer(role.investor2, GMBC(2), {from: role.investor1});
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), GMBC(8));
        assert.equal(await token.balanceOf(role.investor2, {from: role.nobody}), GMBC(14));

        await token.approve(role.investor2, GMBC(3), {from: role.investor1});
        assert.equal(await token.allowance(role.investor1, role.investor2, {from: role.nobody}), GMBC(3));
        await token.transferFrom(role.investor1, role.investor3, GMBC(2), {from: role.investor2});
        assert.equal(await token.allowance(role.investor1, role.investor2, {from: role.nobody}), GMBC(1));
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), GMBC(6));
        assert.equal(await token.balanceOf(role.investor2, {from: role.nobody}), GMBC(14));
        assert.equal(await token.balanceOf(role.investor3, {from: role.nobody}), GMBC(2));

        assert((await token.totalSupply({from: role.nobody})).eq(GMBC(22)));
    });

    it("Crowdsale", async function () {

    })

    it("Invalid transactions", async function() {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

        shouldThrow(token.mint(role.investor1, GMBC(0), {from: role.owner1}))
        shouldThrow(token.finalize(), { from: role.owner })

    });

    it("Ownership", async function () {
        const role = getRoles();

        const token = await Token.new({from: role.owner1});

        shouldThrow( token.mint(role.investor1, GMBC(12), {from: role.investor1}) )
        shouldThrow( token.transferOwnership(role.investor1, {from: role.investor1}) )
    });
});
