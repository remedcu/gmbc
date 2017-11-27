'use strict';

const PreICO2 = artifacts.require("./test_helpers/campaigns/PreICO2.sol");
const Token = artifacts.require("./Token.sol");


contract('PreICO2', function(accounts) {

    function getRoles() {
        return {
            owner1: accounts[1],
            owner2: accounts[2],
            beneficiary: accounts[3],
            team: accounts[4],
            game: accounts[5],
            advisors: accounts[6],
            bounty: accounts[7],
            founders: accounts[8]
        };
    }

async function expectThrow(promise) 
{
		let addError;
		try {
		   await promise;
	    } catch (error) {
            addError = error;    	
        }
		assert.notEqual(addError, undefined, 'Error must be thrown');
};

async function instantiate()
{
        const role = getRoles();
        const token = await Token.new({from: role.owner1});
        const ico = await PreICO2.new(token.address, role.beneficiary, role.team, role.game, role.advisors, role.bounty, role.founders, {from: role.owner2});
        await token.changeCrowdsale(ico.address, {from: role.owner1});
	    return [ico, token, role];
};


    function ETH(amount) {
        return web3.toWei(amount, 'ether');
    }


    it("Check Values", async function() {
        const [ico, token, role] = await instantiate();

        assert.equal(await ico.icoStartTime(), (new Date('January 10, 2018 08:00:00 GMT+3')).getTime() / 1000);
        assert.equal(await ico.icoEndTime(), (new Date('January 26, 2018 23:59:59 GMT+3')).getTime() / 1000);
        assert.equal(await ico.lockTillTime(), (new Date('March 28, 2018 8:00:00 GMT+3')).getTime() / 1000);

        assert.equal((await ico.softcap()).toNumber(), ETH(3000));
        assert.equal((await ico.hardcap()).toNumber(), ETH(8000));
        assert.equal((await ico.minValue()).toNumber(), ETH(0.1));

        assert.equal(await ico.getDiscount(ETH(500)), 50);
        assert.equal(await ico.getDiscount(ETH(100)), 40);
        assert.equal(await ico.getDiscount(ETH(10)), 30);
        assert.equal(await ico.getDiscount(ETH(1)), 25);
        assert.equal(await ico.getDiscount(ETH(0.1)), 20);
    });
});
