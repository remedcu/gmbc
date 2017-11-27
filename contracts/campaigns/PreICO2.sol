pragma solidity ^0.4.15;

import '../Crowdsale.sol';

contract PreICO2 is Crowdsale 
{
    function PreICO2(address _tokenAddress, address beneficiary, address team, address game, address advisors, address bounty, address founders) public
        Crowdsale(_tokenAddress, 
        /*startTime  January 10, 2018 08:00:00 GMT+3*/ 1515560400, 
        /*endTime  January 26, 2018 23:59:59 GMT+3*/ 1517000399, 
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
			return 50;
		}
		if (money >= 100 ether)
		{
			return 40;
		}
		if (money >= 10 ether)
		{
			return 30;
		}
		if (money >= 1 ether)
		{
			return 25;
		}
		return 20;
	}

	function hardcap() public pure returns (uint256)
	{
		return 8000 ether;
	}
	function softcap() public pure returns (uint256)
	{
		return 3000 ether;
	}
	function minValue() public pure returns (uint256)
	{
		return 0.1 ether;
	}
}
