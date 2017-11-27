'use strict';

const Token = artifacts.require("./Token.sol");
const ClosedRound = artifacts.require("./campaigns/ClosedRound.sol");
const PreICO = artifacts.require("./campaigns/PreICO.sol");
const PreICO2 = artifacts.require("./campaigns/PreICO2.sol");
const ICO = artifacts.require("./campaigns/ICO.sol");

const tokenAddress = "0x0"; // TODO: fill correct values
const beneficiary = "0x0";
const team = "0x0";
const game = "0x0";
const advisors = "0x0";
const bounty = "0x0";
const founders = "0x0";

module.exports = function(deployer, network, accounts) {
//    deployer.deploy(Token, {from: accounts[1]});

   	deployer.deploy(ClosedRound, tokenAddress, beneficiary, team, game, advisors, bounty, founders, {from: accounts[2]});
   	deployer.deploy(PreICO, tokenAddress, beneficiary, team, game, advisors, bounty, founders, {from: accounts[2]});
   	deployer.deploy(PreICO2, tokenAddress, beneficiary, team, game, advisors, bounty, founders, {from: accounts[2]});
   	deployer.deploy(ICO, tokenAddress, beneficiary, team, game, advisors, bounty, founders, {from: accounts[2]});
};
