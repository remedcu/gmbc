'use strict';

const GMBCToken = artifacts.require("./GMBCToken.sol");

module.exports = function(deployer, network, accounts) {

    deployer.deploy(GMBCToken);
};
