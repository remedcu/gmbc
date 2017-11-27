pragma solidity ^0.4.15;

import '../Crowdsale.sol';

contract ICO is Crowdsale 
{
    function ICO(address _tokenAddress, address beneficiary, address team, address game, address advisors, address bounty, address founders) public
        Crowdsale(_tokenAddress, 
        /*startTime February 1, 2018 8:00:00 GMT+3*/ 1517461200, 
        /*endTime February 28, 2018 23:59:59 GMT+3*/ 1519851599, 
        /*lockTime  March 28, 2018 8:00:00 GMT+3*/ 1522213200, 
        beneficiary)
    {
    	addPool(team, 10);
    	addPool(game, 20);
    	addPool(advisors, 5);
    	addPool(bounty, 2);
    	addPool(founders, 3);
		state = State.Default;
    }

	function getDiscount(uint money) public pure returns (uint256 percent)
	{
		if (money >= 500 ether)
		{
			return 20;
		}
		if (money >= 100 ether)
		{
			return 15;
		}
		if (money >= 10 ether)
		{
			return 10;
		}
		if (money >= 1 ether)
		{
			return 5;
		}
		return 0;
	}

	function hardcap() public pure returns (uint256)
	{
		return 100000 ether;
	}
	function softcap() public pure returns (uint256)
	{
		return 10000 ether;
	}
	function minValue() public pure returns (uint256)
	{
		return 0.1 ether;
	}
}
