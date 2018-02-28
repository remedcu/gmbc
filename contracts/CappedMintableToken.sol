pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title Mintable token with an end-of-mint date and token cap
 * Based on zeppelin-solidity MintableToken & CappedToken
 */
contract CappedMintableToken is StandardToken, Ownable {
  using SafeMath for uint256;

  event Mint(address indexed to, uint256 amount);

  modifier canMint() {
    require(now <= canMintUntil);
    _;
  }

  uint256 public canMintUntil;
  uint256 public cap;

  function CappedMintableToken(uint256 _cap, uint256 _canMintUntil) public {
    require(_canMintUntil > now);
    require(_cap > 0);

    canMintUntil = _canMintUntil;
    cap = _cap;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyOwner canMint public returns (bool) {
    require(totalSupply_.add(_amount) <= cap);
    require(_amount > 0);

    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
    return true;
  }
}
