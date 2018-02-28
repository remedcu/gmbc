pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/CappedToken.sol"; 
import "zeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract GMBCToken is HasNoEther, CappedToken {
	using SafeMath for uint256;

	string public constant name = "Gamblica Coin";
	string public constant symbol = "GMBC";
	uint8 public constant decimals = 18;

	uint256 public GMBC_TOKEN_CAP = 10000 * (10 ** uint256(decimals));	//uint256 cast to prevent compiler warnings

	address public accountant;	//account responsible for withdrawing funds, also a game fund (20%)
	address public fund;		//20% of all tokens sold will be minted here (3% bounty, 2% founders, 5% advisory, 10% team)

	mapping(address => bytes32) public history;

	event GMBCDeposited(address tokenOwner, uint256 value, bytes32 history);
	event GMBCWithdrawn(address tokenOwner, uint256 value, bytes32 history);

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

	function depositGMBC(uint256 _amount, bytes32 _history) public returns (bool) {
		require(_amount > 0);

		transfer(accountant, _amount);

		history[msg.sender] = _history;

		GMBCDeposited(msg.sender, _amount, _history);
		
		return true;
	}

	function withdrawGMBC(address _tokenOwner, uint256 _amount, bytes32 _history) onlyAccountant public returns (bool) {		
		require(_amount > 0);

		transfer(_tokenOwner, _amount);

		history[_tokenOwner] = _history;

		GMBCWithdrawn(_tokenOwner, _amount, _history);

		return true;
	}

	function setAccountant(address _newAccounant) onlyOwner public {
		accountant = _newAccounant;
	}

	function historyOf(address _tokenOwner) public view returns (bytes32) {
    	return history[_tokenOwner];
  	}
}
