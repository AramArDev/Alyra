// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.10;

interface IAASwapCallee {
    function aaSwapCall(address sender, uint amount0, uint amount1, bytes calldata data) external;
}
