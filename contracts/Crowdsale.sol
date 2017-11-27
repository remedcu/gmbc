pragma solidity ^0.4.15;

import "./owned.sol";
import "./Token.sol";

contract Crowdsale is owned
{
	enum State {
		None,
		Default,
		Withdrawed,
		Cancelled
	}
	State state = State.None;

	function hardcap() public pure returns (uint256)
	{
		return 2 ether;
	}
	function softcap() public pure returns (uint256)
	{
		return 1 ether;
	}
	function minValue() public pure returns (uint256)
	{
		return 50 finney; // change to "10 ether" for pre-sale
	}

	uint public icoStartTime;
	uint public icoEndTime;
	bool public IcoClosedManually = false;
	bool public paused = false;
	uint public pricePerTokenInWei = 10000000000000;
	uint public totalCollected = 0;
	uint public tokensCollected = 0;
	uint public lockTillTime;
	uint constant tokenMultiplier = 10 ** 18;

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
		if (money >= 10 ether)
		{
			return 40;
		}
		return 0;
	}

	function getBonus(uint money, uint tokens) internal pure returns (uint256 additionalTokens)
	{
		uint multiplier = 100*tokenMultiplier / (100 - getDiscount(money)) - tokenMultiplier; // *tokenMultiplier
		return tokens * multiplier / tokenMultiplier;
	}

	Token public token;

	struct backer {
		bool exists;
		uint tokens;
		uint investedMoney;
	}

	address[] public backerByIndex;
	mapping (address => backer) public backers;

	struct Pool
	{
		address pool;
		uint percent;
	}

	Pool[] public pools;
	address public beneficiary;
	
	event Backer(address from, uint money, uint tokens);
	event FundTransfer(address to, uint amount);
	event cancelEvent(address to, uint tokens, uint investedMoney);
	event cantCancelEvent(address to, uint tokens, uint investedMoney);


	function Crowdsale(address _tokenAddress, uint startTime, uint endTime, uint lockTime, address _beneficiary) public
	{
		require(startTime < endTime);
		token = Token(_tokenAddress);
		icoStartTime = startTime;
		icoEndTime = endTime;
		lockTillTime = lockTime;
		beneficiary = _beneficiary;
	}

	function isOpen() public constant returns (bool open) {
		return 
			state == State.Default &&
			getCurrentTime() >= icoStartTime && 
			getCurrentTime() <= icoEndTime && 
			!IcoClosedManually && 
			!isReachedHardCap();
	}

	function isOpenAndUnpaused() public constant returns (bool open) {
		return 
			isOpen() &&
			!paused;
	}

	function closeIcoPrematurely() public onlyOwner {
		require(isOpen());
		IcoClosedManually = true;
	}

	function pause() public onlyOwner {
		paused = true;
	}

	function unpause() public onlyOwner {
		paused = false;
	}

	function isReachedHardCap() public constant returns (bool reached) {
		return totalCollected >= hardcap();
	}

	function isReachedSoftCap() public constant returns (bool reached) {
		return totalCollected >= softcap();
	}

/*	function kill() public onlyOwner {
		require(!isOpen());
		require(!paused);
		selfdestruct(owner);
	}
*/

	function deposit() public payable onlyOwner {
	}

	function() public payable {
		processPayment(msg.sender, msg.value);
	}

	function pay() public payable {
		processPayment(msg.sender, msg.value);
	}

	function processPayment(address from, uint amount) internal 
	{
		require(msg.value >= minValue());
		require(isOpenAndUnpaused());

		uint original = amount;

		uint _price = pricePerTokenInWei;
		uint remain = hardcap() - totalCollected;
		if (remain < amount) {
			amount = remain;
		}

		uint tokenAmount = tokenMultiplier * amount / _price;

		uint currentMoneyAmount = tokenAmount * _price / tokenMultiplier;

		uint bonus = getBonus(currentMoneyAmount, tokenAmount);

		tokenAmount = tokenAmount + bonus;

		mint(currentMoneyAmount, tokenAmount, from, lockTillTime);

		uint change = original - currentMoneyAmount;

		if (!backers[from].exists)
		{
			backerByIndex.push(from);
			backers[from].exists = true;
		}

		backers[from].tokens += tokenAmount;
		backers[from].investedMoney += currentMoneyAmount;
		Backer(from, currentMoneyAmount, tokenAmount);

		if (change > 0) {
			if (from.send(change)) {
				FundTransfer(from, change);
			}
			else revert();
		}
	}

	function mint(uint amount, uint tokens, address sender, uint lockTillTime1) internal {
	    require(tokens > 0);
		totalCollected += amount;
		tokensCollected += tokens;
		token.mint(sender, tokens, lockTillTime1);
	}

	function contractBalance() public constant returns (uint256 balance) {
		return this.balance;
	}

	function isFinished() internal constant returns (bool finished) {
		return  
			getCurrentTime() > icoEndTime || 
			IcoClosedManually || 
			isReachedHardCap();
	}

	function setIcoSucceeded() public onlyOwner 
	{
		require(isFinished());
		require(state == State.Default);

		state = State.Withdrawed;

		if (beneficiary.send(this.balance)) 
		{
			FundTransfer(beneficiary, this.balance);
		}
		else
		{
			revert();
		}

		uint totalpercents = 0;
		for (uint256 i = 0; i < pools.length; i++)
		{
			totalpercents += pools[i].percent;
		}

		uint needTotalTokens = 100*tokensCollected/(100-totalpercents);
		for (uint256 j = 0; j < pools.length; j++)
		{
			uint poolTokens = needTotalTokens * pools[j].percent/100;
			if (poolTokens > 0)
			{
				token.mint(pools[j].pool, poolTokens, lockTillTime);
			}
		}
	}

	function setIcoFailed() public onlyOwner
	{
		require(isFinished());
		require(state == State.Default);

		state = State.Cancelled;
	}

	function cancelByOwner(address to) public onlyOwner
	{
		cancelBacker(to);
	}

	function cancelMe() public
	{
		cancelBacker(msg.sender);
	}
	
	function cancelBacker(address to) internal
	{
		require(state == State.Cancelled);

		uint tokens = backers[to].tokens;
		uint investedMoney = backers[to].investedMoney;

		if (investedMoney == 0)
		{
			revert();
		}

		if (token.balanceOf(to) < tokens)
		{
			cantCancelEvent(to, tokens, investedMoney);
			return;
		}

		token.burn(to, tokens);
		backers[to].tokens -= tokens;
		backers[to].investedMoney -= investedMoney;

		if (to.send(investedMoney))
		{
			cancelEvent(to, tokens, investedMoney);
		}
		else
		{
			revert();
		}
	}

	function addPool(address to, uint percent) public onlyOwner
	{
		require(state == State.None);
		require(percent > 0);

		pools.push(Pool({pool:to, percent: percent}));
	}
	
    /// @dev to be overridden in tests
    function getCurrentTime() internal constant returns (uint) {
        return now;
    }
}