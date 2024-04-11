// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 导入可升级合约的 Ownable 版本
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Voting is Initializable, OwnableUpgradeable {
    // 投票结构体
    struct Vote {
        bool voted;
        uint voteProposal;
    }

    // 提案结构体
    struct Proposal {
        string name;
        uint voteCount;
    }

    // 投票提案内容
    Proposal[] public proposals;
    // 跟踪地址是否对某个投票内容进行了投票
    mapping(address => Vote) public votes;
    string name;
    string description;
    uint public startTime;
    uint public endTime;

    // 创建提案事件
    event ProposalCreated(string name);
    // 删除提案事件
    event ProposalDeleted(uint proposal);
    // 投票事件
    event Voted(address voter, uint proposal);

    function initialize(string[] memory proposalNames, 
            string memory _name, 
            string memory _description, 
            uint _startTime, 
            uint _endTime
    ) public initializer {
        // 首先调用 OwnableUpgradeable 的初始化函数
        __Ownable_init(msg.sender);
        require(_startTime < _endTime, "Start time must be before end time.");
        name = _name;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
            emit ProposalCreated(proposalNames[i]);
        }
    }

    // 添加提案的函数
    function addProposal(string memory newName) public {
        // 首先调用 OwnableUpgradeable 的初始化函数
        // __Ownable_init(msg.sender);
        proposals.push(Proposal({
            name: newName,
            voteCount: 0
        }));
        emit ProposalCreated(newName);
    }

    // 删除提案的函数
    function delProposal(uint proposal) public {
        // 首先调用 OwnableUpgradeable 的初始化函数
        // __Ownable_init(msg.sender);
        // 确保索引在数组长度内
        require(proposal < proposals.length, "Index out of bounds");
        // 将要删除元素之后的所有元素向前移动一位
        for (uint i = proposal; i < proposals.length - 1; i++) {
            proposals[i] = proposals[i + 1];
        }
        // 移除数组最后一个元素
        proposals.pop();
        emit ProposalDeleted(proposal);
    }

    // 投票函数
    function vote(uint proposal) public {
        require(block.timestamp > startTime, "Voting has not started.");
        require(block.timestamp < endTime, "Voting has ended.");
        require(!votes[msg.sender].voted, "Already voted.");
        require(proposal < proposals.length, "Invalid proposal index.");
        votes[msg.sender] = Vote(true, proposal);
        proposals[proposal].voteCount += 1;
        emit Voted(msg.sender, proposal);
    }

    function getProposals() view public returns (Proposal[] memory _proposals) {
        _proposals = proposals;
    }

    function winningProposal() public view returns (uint _winningProposal) {
        uint winningVoteCount = 0;
        
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                _winningProposal = i;
            }
        }
    }
}