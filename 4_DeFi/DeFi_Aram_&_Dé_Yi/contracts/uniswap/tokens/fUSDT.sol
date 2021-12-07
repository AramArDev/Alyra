// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract fUSDT is ERC20 {
    constructor() ERC20("fUSDT Stablecoin", "fUSDT") {}

    function mint(address _recipient, uint _amount) external {
        _mint(_recipient, _amount);
    }
}