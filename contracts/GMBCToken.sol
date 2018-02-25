pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol"; 
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/ownership/HasNoEther.sol";

contract GMBCToken is StandardToken, Ownable, HasNoEther {

	string public constant name = "Gamblica Coin";
	string public constant symbol = "GMBC";
	uint8 public constant decimals = 18;

	uint256 public INITIAL_SUPPLY = 10000 * (10 ** uint256(decimals));	//uint256 cast to prevent compiler warnings

	/**
	 * GMBCToken
	 * https://gamblica.com 
	 * Official Gamblica Coin (Token)
	 */
	function GMBCToken() public {
		totalSupply_ = INITIAL_SUPPLY;
		balances[msg.sender] = INITIAL_SUPPLY;
		Transfer(0x0, msg.sender, INITIAL_SUPPLY);
	}
}
