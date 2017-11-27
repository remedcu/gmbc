pragma solidity ^0.4.15;

import '../Crowdsale.sol';

contract ClosedRound is Crowdsale 
{
    function ClosedRound(address _tokenAddress, address beneficiary, address team, address game, address advisors, address bounty, address founders) public
        Crowdsale(_tokenAddress, 
        /*startTime December 12, 2017 08:00:00 GMT+3*/ 1513054800, 
        /*endTime December 22, 2017 23:59:59 GMT+3*/ 1513976399, 
        /*lockTime  March 28, 2018 08:00:00 GMT+3*/ 1522213200, 
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
			return 70;
		}
		if (money >= 100 ether)
		{
			return 60;
		}
		if (money >= 50 ether)
		{
			return 50;
		}
		return 40;
	}

	function hardcap() public pure returns (uint256)
	{
		return 1000000000 ether;
	}
	function softcap() public pure returns (uint256)
	{
		return 10 ether;
	}
	function minValue() public pure returns (uint256)
	{
		return 10 ether;
	}
}
