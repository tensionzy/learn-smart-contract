// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Crowdfunding is Initializable, ReentrancyGuardUpgradeable {
    // 众筹目标金额
    uint public targetAmount;
    // 目前贡献金额
    uint public totalContributed;
    // 截止日期
    uint public deadline;
    address public owner;
    // 所有贡献者的map
    mapping(address => uint) public contributions;

    function initialize(uint _targetAmount, uint _durationMinutes) public initializer {
        targetAmount = _targetAmount;
        deadline = block.timestamp + (_durationMinutes * 1 minutes);
        owner = msg.sender;
    }

    // 贡献
    function contribute() external payable {
        require(block.timestamp < deadline, "Crowdfunding has ended");
        require(msg.value > 0, "Contribution must be more than 0");

        contributions[msg.sender] += msg.value;
        totalContributed += msg.value;
    }

    // 提款
    function withdrawFunds() external {
        require(msg.sender == owner, "Only owner can withdraw funds");
        require(block.timestamp > deadline, "Crowdfunding not yet ended");
        require(totalContributed >= targetAmount, "Target amount not reached");

        payable(owner).transfer(address(this).balance);
    }

    // 退款
    function refund() external nonReentrant {
        require(block.timestamp > deadline, "Crowdfunding not yet ended");
        require(totalContributed < targetAmount, "Target amount was reached");

        uint contributedAmount = contributions[msg.sender];
        require(contributedAmount > 0, "No contributions to refund");

        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(contributedAmount);
    }

    function extendDeadline(uint additionalMinutes) public {
        require(msg.sender == owner, "Only owner can withdraw funds");
        deadline += (additionalMinutes * 1 minutes);
    }
}
