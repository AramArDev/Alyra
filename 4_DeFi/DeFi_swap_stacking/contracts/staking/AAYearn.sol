// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../sushiswap/AAS.sol";

contract AAYearn is ERC20 {

    AAS public token;
    uint public mintAmount;
    uint public insurance;
    uint timestamp;

    /// @param _token the address of token AAS
    /// @param _mintAmount the amount we want mint every hour
    constructor(address _token, uint _mintAmount) ERC20("stkAAS Token", "stkAAS") {
        token = AAS(_token);
        mintAmount = _mintAmount;
        timestamp = block.timestamp;
    }

    /// @dev ignore insurance fund for balance calculations
    function balance() public view returns (uint) {
        return token.balanceOf(address(this)) - insurance;
    }

    function deposit(uint _amount) public {
        require(_amount > 0, "AAYearn: invalid amount");

        uint _pool = balance();
        token.transferFrom(msg.sender, address(this), _amount);

        uint _insurance = (_amount * 50) / 10000;
        _amount = _amount - _insurance;
        insurance = insurance + _insurance;

        uint shares = 0;
        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply()) / _pool;
        }
        _mint(msg.sender, shares);
    }

    function depositAll() external {
        deposit(token.balanceOf(msg.sender));
    }

    function withdraw(uint _shares) public {
        uint r = (balance() * _shares) / totalSupply();
        _burn(msg.sender, _shares);
        token.transfer(msg.sender, r);
    }

    function withdrawAll() external {
        withdraw(balanceOf(msg.sender));
    }

    /// @dev mint every one hour
    function mint() public {
        require(block.timestamp >= timestamp + 1 seconds/* 1 hours */, "AAYearn: not timestamp");
        timestamp = block.timestamp;
        token.mint(address(this), mintAmount);
    }
}
