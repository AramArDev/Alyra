// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AAS is ERC20, Ownable {

    address[2] twoAdmins;

    constructor() ERC20("AAS Token", "AAS") {}

    /// @dev initialize two admins (MasterChef and Yearn)
    function addAdmin(address _admin) external onlyOwner {
        require(_admin != address(0), "AAS: invalid address");
        require(twoAdmins[0] == address(0) || twoAdmins[1] == address(0),
            "AAS: 2 admins already exist");

        // necessarily one of the two cases is address(0)
        if (twoAdmins[0] == address(0)) {
            twoAdmins[0] = _admin;
        } else {
            twoAdmins[1] = _admin;
        }        
    }

    /// @dev mint for only two admins (MasterChef and Yearn)
    function mint(address _recipient, uint256 _amount) external {
        require(_recipient != address(0) && _amount > 0, "AAS: input error");
        require(msg.sender == twoAdmins[0] || msg.sender == twoAdmins[1],
            "AAS: you are not a admin");
        _mint(_recipient, _amount);
    }
}
