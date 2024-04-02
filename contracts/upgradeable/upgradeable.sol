// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KuiToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("KuiToken", "KTK") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    // 只有合约的所有者可以铸造代币
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    // 只有合约的所有者可以销毁代币
    function burn(uint256 _amount) public onlyOwner {
        _burn(msg.sender, _amount);
    }
}