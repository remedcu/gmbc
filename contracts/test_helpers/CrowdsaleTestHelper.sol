pragma solidity ^0.4.15;

import '../Crowdsale.sol';


/// @title Test helper for Crowdsale, DONT use it in production!
contract CrowdsaleTestHelper is Crowdsale 
{
    uint m_time;

    function CrowdsaleTestHelper(
    		address _tokenAddress, 
    		uint startTime, 
    		uint icoEndTime,
    		uint lockDays,
    		address beneficiary,
    		address pool1,
    		address pool2) public
        Crowdsale(_tokenAddress, startTime, icoEndTime, icoEndTime + lockDays*60*60*24, beneficiary)
    {
    	addPool(pool1, 10);
    	addPool(pool2, 20);
		state = State.Default;
    }

    function getCurrentTime() internal constant returns (uint) {
        return m_time;
    }

    function setTime(uint time) external onlyOwner {
        m_time = time;
    }

	function getDiscount(uint money) public pure returns (uint256 percent)
	{
		if (money >= 3 ether)
		{
			return 90;
		}
		if (money >= 2 ether)
		{
			return 50;
		}
		if (money >= 1 ether)
		{
			return 25;
		}
		return 0;
	}

	function hardcap() public pure returns (uint256)
	{
		return 10 ether;
	}
	function softcap() public pure returns (uint256)
	{
		return 1 ether;
	}
	function minValue() public pure returns (uint256)
	{
		return 50 finney;
	}
}
