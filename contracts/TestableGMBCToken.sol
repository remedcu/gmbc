pragma solidity ^0.4.18;

import "./GMBCToken.sol";

contract TestableGMBCToken is GMBCToken {

	function getNow() public view returns (uint256) {
		return now;
	}

	// can't call function named send from truffle
	function sendAlias(address target, uint256 mintedAmount, uint256 lockTime) public onlyOwnerOrCrowdsale {
    	send(target, mintedAmount, lockTime);
  	}
}
