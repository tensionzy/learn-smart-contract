// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UpgradeableV2 is Initializable {
    uint256 public value;
    string public name;

    function initialize(uint256 _value, string memory _name) public {
        value = _value;
        name = _name;
    }

    function setValue(uint256 _value) public {
        value = _value;
    }

    function setName(string memory _name) public {
        name = _name;
    }
}