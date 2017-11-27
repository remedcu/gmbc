'use strict';

const Crowdsale = artifacts.require("./test_helpers/CrowdsaleTestHelper.sol");
const Token = artifacts.require("./Token.sol");



contract('Crowdsale', function(accounts) {

    function getRoles() {
        return {
            owner1: accounts[1],
            owner2: accounts[2],
            investor1: accounts[3],
            investor2: accounts[4],
            investor3: accounts[5],
            nobody: accounts[6],
            pool1: accounts[7],
            pool2: accounts[8],
            beneficiary: accounts[8],
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

const startTime = 100000;
const durationDays = 1;
const endTime = startTime + durationDays*24*60*60;
const hardcap = ETH(10);

async function instantiate()
{
        const role = getRoles();
        const token = await Token.new({from: role.owner1});
        const ico = await Crowdsale.new(token.address, startTime, endTime, 1, role.beneficiary, role.pool1, role.pool2, {from: role.owner2});
        await token.changeCrowdsale(ico.address, {from: role.owner1});
	    return [ico, token, role];
};


    function ETH(amount) {
        return web3.toWei(amount, 'ether');
    }

    function Now() {
        return Math.floor(new Date() / 1000);
    }

    it("Deposit", async function() {
        const [ico, token, role] = await instantiate();
        await ico.setTime(startTime + 1, {from: role.owner2});

        await ico.deposit({from: role.owner2, value: ETH(1)});
        assert.equal(web3.eth.getBalance(ico.address), ETH(1));
    });


    it("Pay, min value, contractBalance", async function() {

        const [ico, token, role] = await instantiate();
        await ico.setTime(startTime + 1, {from: role.owner2});

        assert.equal(web3.eth.getBalance(ico.address), ETH(0));
        await ico.pay({from: role.investor1, value: ETH(1)});
        assert.equal(web3.eth.getBalance(ico.address), ETH(1));

        await ico.sendTransaction({from: role.investor2, value: ETH(1)});
        assert.equal(web3.eth.getBalance(ico.address), ETH(2));

        assert.equal(await ico.contractBalance(), ETH(2));

        await expectThrow(ico.sendTransaction({from: role.investor2, value: ETH(0.0001)})); //min value      
    });

    it("Pay before start", async function() {
        const [ico, token, role] = await instantiate();

        await ico.setTime(startTime - 2, {from: role.owner2});

        assert.equal(web3.eth.getBalance(ico.address), ETH(0));

        await expectThrow(ico.pay({from: role.investor1, value: ETH(1)}));
        assert.equal(web3.eth.getBalance(ico.address), ETH(0));

        await expectThrow(ico.sendTransaction({from: role.investor2, value: ETH(1)}));
        assert.equal(web3.eth.getBalance(ico.address), ETH(0));
    });

    it("Pay after end", async function() {
        const [ico, token, role] = await instantiate();

        await ico.setTime(endTime + 1, {from: role.owner2});

        assert.equal(web3.eth.getBalance(ico.address), ETH(0));

        await expectThrow(ico.pay({from: role.investor1, value: ETH(1)}));
        assert.equal(web3.eth.getBalance(ico.address), ETH(0));

        await expectThrow(ico.sendTransaction({from: role.investor2, value: ETH(1)}));
        assert.equal(web3.eth.getBalance(ico.address), ETH(0));
    });

    it("HardCap and change", async function() {

        const [ico, token, role] = await instantiate();
        await ico.setTime(startTime + 1, {from: role.owner2});

        assert.equal(web3.eth.getBalance(ico.address), ETH(0));
        const a = ETH(1);
        await ico.pay({from: role.investor1, value: a, gasPrice: 0});
        assert.equal(web3.eth.getBalance(ico.address), a);

        const investor2InitalBalance = web3.eth.getBalance(role.investor2).toNumber();

        const b = ETH(10);
        await ico.sendTransaction({from: role.investor2, value: b, gasPrice: 0});
        assert.equal(web3.eth.getBalance(ico.address), hardcap); // limited to hardcap

        const investor2EndBalance = web3.eth.getBalance(role.investor2).toNumber();

        assert.equal(investor2InitalBalance - investor2EndBalance,  hardcap - a); // change received
    });

    it("Tokens and bonuses", async function() {

        const [ico, token, role] = await instantiate();
        await ico.setTime(startTime + 1, {from: role.owner2});

        assert.equal(web3.eth.getBalance(ico.address), ETH(0));
        await ico.pay({from: role.investor1, value: ETH(0.1)});
        assert.equal(web3.eth.getBalance(ico.address), ETH(0.1));

        assert.equal((await token.balanceOf(role.investor1, {from: role.nobody})).toNumber(), ETH(10000)); 
        
        await ico.pay({from: role.investor2, value: ETH(1)});
        assert.equal((await token.balanceOf(role.investor2, {from: role.nobody})).toNumber(), ETH(100000)/(0.75)); 

        await ico.pay({from: role.investor3, value: ETH(2)});
        assert.equal((await token.balanceOf(role.investor3, {from: role.nobody})).toNumber(), ETH(200000)/(0.5)); 
    });

    it("State", async function() {

        const [ico, token, role] = await instantiate();
        await ico.setTime(startTime + 1, {from: role.owner2});

        await ico.pay({from: role.investor1, value: ETH(0.1)});

        await expectThrow(ico.cancelByOwner(role.investor1, {from: role.owner2}));
        await expectThrow(ico.cancelMe({from: role.investor1}));

        await expectThrow(ico.setIcoSucceeded({from: role.owner2}));
        await expectThrow(ico.setIcoFailed({from: role.investor1}));

        await ico.closeIcoPrematurely({from: role.owner2});
        await ico.setIcoSucceeded({from: role.owner2});
        await expectThrow(ico.setIcoFailed({from: role.investor1}));
    });

    it("State2", async function() {
        const [ico, token, role] = await instantiate();
        await ico.setTime(startTime + 1, {from: role.owner2});

        await ico.closeIcoPrematurely({from: role.owner2});
        await ico.setIcoFailed({from: role.owner2});
        await expectThrow(ico.setIcoSucceeded({from: role.investor1}));
    });

    it("Pause", async function() {
        const [ico, token, role] = await instantiate();
        await ico.setTime(startTime + 1, {from: role.owner2});

        await ico.pay({from: role.investor1, value: ETH(0.1)});

        await ico.pause({from: role.owner2});
        await expectThrow(ico.pay({from: role.investor1, value: ETH(0.1)}));
        await ico.unpause({from: role.owner2});

        await ico.pay({from: role.investor1, value: ETH(0.1)});
    });

    it("setIcoSucceeded", async function() {
        const [ico, token, role] = await instantiate();
        await ico.setTime(startTime + 1, {from: role.owner2});

        const e = web3.eth.getBalance(role.beneficiary).toNumber();

        await ico.pay({from: role.investor1, value: ETH(1)});
        await ico.pay({from: role.investor2, value: ETH(2)});
        await ico.pay({from: role.investor3, value: ETH(3)});
        await ico.pay({from: role.investor2, value: ETH(1)});

        await ico.setTime(endTime+ 1, {from: role.owner2});

        const total = await token.totalSupply({from: role.nobody});

        await ico.setIcoSucceeded({from: role.owner2});

        assert.equal(web3.eth.getBalance(ico.address), ETH(0));

        assert.equal((await token.balanceOf(role.pool1, {from: role.nobody})).toNumber(), total/0.7*0.1); // 10%
 		assert.equal((await token.balanceOf(role.pool2, {from: role.nobody})).toNumber(), total/0.7*0.2); // 20%

        assert.equal(web3.eth.getBalance(role.beneficiary).toNumber() - e, ETH(7));
    });

    it("setIcoFailed", async function() {
        const [ico, token, role] = await instantiate();
        await ico.setTime(startTime + 1, {from: role.owner2});

        const e1 = web3.eth.getBalance(role.investor1).toNumber();
        const e2 = web3.eth.getBalance(role.investor2).toNumber();

        await ico.pay({from: role.investor1, value: ETH(0.1), gasPrice: 0});
        await ico.pay({from: role.investor2, value: ETH(0.2), gasPrice: 0});
        await ico.pay({from: role.investor3, value: ETH(0.3), gasPrice: 0});
        await ico.pay({from: role.investor2, value: ETH(0.1), gasPrice: 0});

        const e3 = web3.eth.getBalance(role.investor3).toNumber();

        assert.equal((await token.balanceOf(role.investor1, {from: role.nobody})).toNumber(), ETH(10000));
        assert.equal((await token.balanceOf(role.investor2, {from: role.nobody})).toNumber(), ETH(30000));
        assert.equal((await token.balanceOf(role.investor3, {from: role.nobody})).toNumber(), ETH(30000));

        await ico.setTime(endTime+ 1, {from: role.owner2});

        await ico.setIcoFailed({from: role.owner2});
        assert.equal(web3.eth.getBalance(ico.address).toNumber(), ETH(0.7));

        await ico.cancelByOwner(role.investor1, {from: role.owner2});
        await ico.cancelMe({from: role.investor2, gasPrice: 0});

        assert.equal(web3.eth.getBalance(ico.address), ETH(0.3));

        assert.equal((await token.balanceOf(role.investor1, {from: role.nobody})).toNumber(), ETH(0));
        assert.equal((await token.balanceOf(role.investor2, {from: role.nobody})).toNumber(), ETH(0));
        assert.equal((await token.balanceOf(role.investor3, {from: role.nobody})).toNumber(), ETH(30000)); // not cancelled

        assert.equal(web3.eth.getBalance(role.investor1).toNumber(), e1);
        assert.equal(web3.eth.getBalance(role.investor2).toNumber(), e2);
        assert.equal(web3.eth.getBalance(role.investor3).toNumber(), e3);
    });

    it("Access control", async function() {
        const [ico, token, role] = await instantiate();
        await ico.setTime(startTime + 1, {from: role.owner2});

        await expectThrow(ico.closeIcoPrematurely({from: role.nobody}));
        await expectThrow(ico.pause({from: role.nobody}));
        await expectThrow(ico.unpause({from: role.nobody}));
        await expectThrow(ico.deposit({from: role.nobody}));
        await expectThrow(ico.setIcoSucceeded({from: role.nobody}));
        await expectThrow(ico.setIcoFailed({from: role.nobody}));
        await expectThrow(ico.setIcoFailed({from: role.nobody}));
        await expectThrow(ico.cancelByOwner(role.investor1, {from: role.nobody}));
        await expectThrow(ico.addPool(role.investor1, 10, {from: role.nobody}));
	});
});
