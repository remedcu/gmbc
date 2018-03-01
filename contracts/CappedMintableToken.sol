pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title Mintable token with an end-of-mint date and token cap
 * Also transfer / transferFrom is available only after end-of-mint date
 * Based on zeppelin-solidity MintableToken & CappedToken
 */
contract CappedMintableToken is StandardToken, Ownable {
  using SafeMath for uint256;

  event Mint(address indexed to, uint256 amount);

  modifier canMint() {
    require(now <= publicSaleEnd);
    _;
  }

  modifier onlyOwnerOrCrowdsale() {
    require(msg.sender == owner || msg.sender == crowdsale);
    _;
  }

  uint256 public publicSaleEnd;
  uint256 public cap;
  address public crowdsale;

	function setCrowdsale(address _crowdsale) public onlyOwner {
		crowdsale = _crowdsale;
	}

  

  function CappedMintableToken(uint256 _cap, uint256 _publicSaleEnd) public {
    require(_publicSaleEnd > now);
    require(_cap > 0);

    publicSaleEnd = _publicSaleEnd;
    cap = _cap;
  }

  /* StartICO integration, lockTime is ignored (ignore the warning) */
  function send(address target, uint256 mintedAmount, uint256 lockTime) public onlyOwnerOrCrowdsale {
    mint(target, mintedAmount);
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyOwnerOrCrowdsale canMint public returns (bool) {
    require(totalSupply_.add(_amount) <= cap);
    require(_amount > 0);

    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
    return true;
  }

  function transfer(address _to, uint256 _value) public returns (bool) {
    require(now > publicSaleEnd);

    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    require(now > publicSaleEnd);

    return super.transferFrom(_from, _to, _value);
  }
}
