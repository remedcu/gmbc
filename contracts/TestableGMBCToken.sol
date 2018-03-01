pragma solidity ^0.4.18;

import "./GMBCToken.sol";

contract TestableGMBCToken is GMBCToken {

	function getNow() public view returns (uint256) {
		return now;
	}
	
}
