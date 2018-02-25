pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/CappedToken.sol"; 
import "zeppelin-solidity/contracts/ownership/HasNoEther.sol";

contract GMBCToken is HasNoEther, CappedToken  {

	string public constant name = "Gamblica Coin";
	string public constant symbol = "GMBC";
	uint8 public constant decimals = 18;

	uint256 public GMBC_TOKEN_CAP = 10000 * (10 ** uint256(decimals));	//uint256 cast to prevent compiler warnings

	address public accountant;	//account responsible for withdrawing funds
	mapping(address => Fund) public funds;

	event FundsAmountChanged(address tokenOwner, uint256 value, bytes32 history);

	struct Fund {
		bytes32 history;	//history hash
		uint256 amount;		//locked amount (tokens)
	}

	modifier onlyAccountant() {
		require(msg.sender == accountant);
		_;
	}

	/**
	 * GMBCToken
	 * https://gamblica.com 
	 * Official Gamblica Coin (Token)
	 */
	function GMBCToken() public 
		CappedToken(GMBC_TOKEN_CAP)
	{
		
	}

	function addFunds(uint256 _value, bytes32 _history) public returns (bool) {
		Fund storage fund = funds[msg.sender];

		require(_value > 0 && _value <= balances[msg.sender] - fund.amount);

		fund.amount += _value;
		fund.history = _history;

		FundsAmountChanged(msg.sender, fund.amount, _history);

		return true;
	}

	function withdrawFunds(address _tokenOwner, uint256 _value, bytes32 _history) onlyAccountant public returns (bool) {
		require(_value >= 0);

		Fund storage fund = funds[_tokenOwner];
		fund.amount = 0;
		fund.history = _history;

		balances[_tokenOwner] += _value;

		return true;
	}

	function setAccountant(address _newAccounant) onlyOwner public {
		accountant = _newAccounant;
	}

	function transfer(address _to, uint256 _value) public returns (bool) {
		require(_value <= balances[msg.sender] - funds[msg.sender].amount);
		return super.transfer(_to, _value);
	}

}
