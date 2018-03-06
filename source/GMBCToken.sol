pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "./zeppelin-solidity/contracts/math/SafeMath.sol";
import "./CappedMintableToken.sol";

contract GMBCToken is HasNoEther, CappedMintableToken {
	using SafeMath for uint256;

	string public constant name = "Gamblica Token";
	string public constant symbol = "GMBC";
	uint8 public constant decimals = 18;

	uint256 public TOKEN_SALE_CAP = 600000000 * (10 ** uint256(decimals));	// 60%, 40% will be minted on finalize
	uint256 public END_OF_MINT_DATE = 1527811200;	// Fri, 01 Jun 2018 00:00:00 +0000 in RFC 822, 1036, 1123, 2822

	bool public finalized = false;

	/**
	 * GMBCToken
	 * https://gamblica.com 
	 * Official Gamblica Coin (Token)
	 */
	function GMBCToken() public 
		CappedMintableToken(TOKEN_SALE_CAP, END_OF_MINT_DATE)
	{}

	/**
		Performs the final stage of the token sale, 
		mints additional 40% of token fund,
		transfers minted tokens to an external fund
		(20% game fund, 10% team, 5% advisory board, 3% bounty, 2% founders)
	*/
	function finalize(address _fund) public onlyOwner returns (bool) {
		require(!finalized && now > publicSaleEnd);		
		require(_fund != address(0));

		uint256 amount = totalSupply_.mul(4).div(6);	// +40% 

		totalSupply_ = totalSupply_.add(amount);
    	balances[_fund] = balances[_fund].add(amount);
    	Mint(_fund, amount);
    	Transfer(address(0), _fund, amount);
    
		finalized = true;

		return true;
	}


	
}
