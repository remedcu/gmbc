pragma solidity ^0.4.15;

contract GBCToken {
	function mintToken(address target, uint256 mintedAmount, uint256 lockTime);
	function balanceOf(address _owner) constant returns (uint256 balance);
	function burnToken(address target, uint256 burnedAmount);
}

contract owned {
	address public owner;

	function owned() {
		owner = msg.sender;
	}

	function changeOwner(address newOwner) onlyOwner {
		owner = newOwner;
	}

	modifier onlyOwner {
		require(msg.sender == owner);
		_;
	}
}

contract GBCCrowdsale is owned
{
	uint public hardcap = 2 ether;
	uint public softcap = 1 ether;
	uint public minValue = 50 finney; // change to "10 ether" for pre-sale

	uint public icoStartTime;
	uint public icoEndTime;
	bool public IcoClosedManually = false;
	bool public paused = false;
	uint public pricePerTokenInWei = 10000000000000;
	uint public totalCollected = 0;
	uint public lockTillTime;
	uint constant tokenMultiplier = 10 ** 18;

	function getDiscount(uint money) constant returns (uint256 percent)
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

	function getBonus(uint money, uint tokens) constant returns (uint256 additionalTokens)
	{
		uint multiplier = 100*tokenMultiplier / (100 - getDiscount(money)) - tokenMultiplier; // *tokenMultiplier
		return tokens * multiplier / tokenMultiplier;
	}

	GBCToken public token;

	struct backer {
		bool exists;
		uint tokens;
		uint investedMoney;
	}

	address[] public backerByIndex;
	mapping (address => backer) public backers;
	
	event Backer(address from, uint money, uint tokens);
	event FundTransfer(address to, uint amount);
	event cancelEvent(address to, uint tokens, uint investedMoney);
	event cantCancelEvent(address to, uint tokens, uint investedMoney);


	function GBCCrowdsale(address _tokenAddress, uint startTime, uint durationDays, uint lockDays)
	{
		token = GBCToken(_tokenAddress);
		icoStartTime = startTime;
		icoEndTime = icoStartTime + durationDays*60*60*24;
		lockTillTime = icoEndTime + lockDays*60*60*24;
	}

	function isOpen() constant returns (bool open) {
		return 
			now >= icoStartTime && 
			now <= icoEndTime && 
			!IcoClosedManually && 
			!isReachedHardCap() &&
			!paused;
	}

	function closeICO() onlyOwner {
		require(isOpen());
		IcoClosedManually = true;
	}

	function pause() onlyOwner {
		paused = true;
	}

	function unpause() onlyOwner {
		paused = false;
	}

	function isReachedHardCap() constant returns (bool reached) {
		return totalCollected >= hardcap;
	}

	function isReachedSoftCap() constant returns (bool reached) {
		return totalCollected >= hardcap;
	}

	function safeWithdrawal(uint amount) onlyOwner {
		require(this.balance >= amount);
		require(!isOpen());
		require(!paused);

		if (owner.send(amount)) {
			FundTransfer(msg.sender, amount);
		}
	}

	function kill() onlyOwner {
		require(!isOpen());
		require(!paused);
		selfdestruct(owner);
	}

	function() payable {
		require(msg.value >= minValue);
		require(isOpen());

		processPayment(msg.sender, msg.value);
	}

	function processPayment(address from, uint amount) internal {
		uint original = amount;

		uint _price = pricePerTokenInWei;
		uint remain = hardcap - totalCollected;
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
		totalCollected += amount;
		token.mintToken(sender, tokens, lockTillTime1);
	}

	function contractBalance() constant returns (uint256 balance) {
		return this.balance;
	}

	function canCancel() constant returns (bool can) {
		return (now > icoEndTime || IcoClosedManually);
	}

	function cancel() onlyOwner
	{
		require(canCancel());
		for (uint256 k = 0; k < backerByIndex.length; k++)
		{
			cancelBacker(backerByIndex[k]);
		}
	}

	function cancelBacker(address to) internal
	{
		uint tokens = backers[to].tokens;
		uint investedMoney = backers[to].investedMoney;

		if (investedMoney == 0)
		{
			return;
		}

		if (token.balanceOf(to) < tokens)
		{
			cantCancelEvent(to, tokens, investedMoney);
			return;
		}

		token.burnToken(to, tokens);
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
}
