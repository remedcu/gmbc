pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract GMBCToken is StandardToken {

	string public constant name = "Gamblica Coin";
	string public constant symbol = "GMBC";	
	uint8 public constant decimals = 18;

	uint public INITIAL_SUPPLY = 10000 * (10 ** decimals);

	function GMBCToken() {
		totalSupply = INITIAL_SUPPLY;
		balances[msg.sender] = INITIAL_SUPPLY;
	}
}
