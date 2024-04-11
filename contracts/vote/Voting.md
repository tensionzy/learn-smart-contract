# 投票系统

---

## 一、目的

构建一个去中心化的投票系统，允许用户在区块链上投票。投票系统可以帮助我们理解状态变更、事件日志和权限控制。

## 二、实现投票系统

借助OpenZeppelin库和Hardhat框架来实现，涵盖状态变更（投票）、事件日志（投票和提案创建事件）、权限控制（通过`Ownable`合约）的实现方式。

* 安装Hardhat

  ```shell
  npm install --save-dev hardhat
  ```

* 安装OpenZeppelin Contracts:

  ```shell
  npm install @openzeppelin/contracts
  npm install @openzeppelin/contracts-upgradeable
  ```

* 编写智能合约

  在`contracts`目录下创建一个新的Solidity文件，例如`Voting.sol`。这将是你的投票合约。

  ```solidity
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
          __Ownable_init(msg.sender);
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
  ```

## 三、添加事件监听器

监听创建提案事件与删除提案事件

```javascript
const { ethers } = require("hardhat");
const { JsonRpcProvider, FetchRequest } = require('ethers');
const { HttpsProxyAgent } = require('https-proxy-agent');
require('dotenv').config();
const { PROXY_URL, FETCH_REQUEST } = process.env;
const contractAddress = "0x9F48a6B286935F268dd5c33FF3d0c7CbFd83Cb7C";
const ProposalStruct = "(string name, uint voteCount)";
const contractABI = [
    `function addProposal(string newName)`,
    `function delProposal(uint proposal)`,
    `function getProposals() view returns (${ProposalStruct}[] proposal)`,
    `function vote(uint proposal)`,
    `function winningProposal() view returns(uint winningProposal)`,
    // 事件定义
    `event ProposalCreated(string name)`,
    `event ProposalDeleted(uint proposal)`
];
// 中国需要通过代理连接到BSC测试网
const fetchReq = new FetchRequest(FETCH_REQUEST);
fetchReq.getUrlFunc = FetchRequest.createGetUrlFunc({ agent: new HttpsProxyAgent(PROXY_URL) });
const provider = new JsonRpcProvider(fetchReq);
const contract = new ethers.Contract(contractAddress, contractABI, provider);


// contract.on("*", (event) => {
//     console.log("触发事件: ", event);
// });

// 监听ProposalCreated事件
contract.on("ProposalCreated", (name) => {
    console.log('新提案创建: ', name);
});

// 监听ProposalDeleted事件
contract.on("ProposalDeleted", (proposal) => {
    console.log('删除提案: ', proposal);
});
```

## 四、测试

1. 启动监听器

   ```shell
   npx hardhat run scripts/listen/vote-listen.js --network bsctestnet
   ```

2. 编写测试脚本，测试添加提案、删除提案、投票、获取提案、获胜提案票数

   ```javascript
   // 引入必要的库
   const { expect } = require("chai");
   const { JsonRpcProvider, FetchRequest } = require('ethers');
   const { HttpsProxyAgent } = require('https-proxy-agent');
   // 执行scripts目录下的generate-accounts.js文件生成test-accounts.json测试账户
   const testAccounts = require('../scripts/test-accounts.json');
   require('dotenv').config();
   const { PROXY_URL, PRIVATE_KEY, FETCH_REQUEST } = process.env;
   
   // 中国需要通过代理连接到BSC测试网
   const fetchReq = new FetchRequest(FETCH_REQUEST);
   fetchReq.getUrlFunc = FetchRequest.createGetUrlFunc({ agent: new HttpsProxyAgent(PROXY_URL) });
   const provider = new JsonRpcProvider(fetchReq);
   const contractAddress = "0x9F48a6B286935F268dd5c33FF3d0c7CbFd83Cb7C";
   const ProposalStruct = "(string name, uint voteCount)";
   const contractABI = [
       `function addProposal(string newName)`,
       `function delProposal(uint proposal)`,
       `function getProposals() view returns (${ProposalStruct}[] proposal)`,
       `function vote(uint proposal)`,
       `function winningProposal() view returns(uint winningProposal)`
   ];
   describe("voting contract", function () {
       // describe("add proposal", () => {
       //   it("add proposal '游泳'", async () => {
       //     const signer = new ethers.Wallet(PRIVATE_KEY, provider);
       //     const contract = new ethers.Contract(contractAddress, contractABI, signer);
       //     await contract.addProposal("游泳");
       //   });
       // });
       
       describe("del proposals", () => {
           it("del last proposals", async () => {
               const signer = new ethers.Wallet(PRIVATE_KEY, provider);
               const contract = new ethers.Contract(contractAddress, contractABI, signer);
               await contract.delProposal(10);
           });
       });
   
       // describe("voting", () => {
       //     it("test accounts for random voting", async () => {
       //         for (let i = 0; i < testAccounts.length; i++) {
       //             // 从签名者中随机选取一个进行投票
       //             const testAccount = testAccounts[i];
       //             // 随机选择一个提案进行投票，提案索引从0到9
       //             const proposalIndex = Math.floor(Math.random() * 10);
   
       //             // 用随机选取的地址投票给随机选择的提案
       //             const privateKey = testAccount.privateKey;
       //             console.log("account private key is ", privateKey);
       //             const signer = new ethers.Wallet(privateKey, provider);
       //             const contract = new ethers.Contract(contractAddress, contractABI, signer);
       //             const txResponse = await contract.vote(proposalIndex);
       //             // 等待交易确认
       //             const txReceipt = await txResponse.wait();
       //             console.log("txReceipt events is ", txReceipt.events);
       //             // 检索日志中的Voted事件
       //             const votedEvent = txReceipt.events?.filter((x) => { return x.event === "Voted"; });
       //             console.log("votedEvent is ", votedEvent);
   
       //             if (votedEvent && votedEvent.length > 0) {
       //                 const eventArgs = votedEvent[0].args;
       //                 console.log(`Event Log from Receipt: Voter ${eventArgs.voter} voted for proposal ${eventArgs.proposal}.`);
       //             } else {
       //                 console.log("No Voted event found in the transaction receipt.");
       //             }
   
       //             console.log(`Voter ${i} (${signer.address}) voted for proposal ${proposalIndex}`);
       //         }
       //     });
       // });
   
       describe("get proposals", () => {
           it("get all proposals", async () => {
               const contract = new ethers.Contract(contractAddress, contractABI, provider);
               console.log("all proposals is ", await contract.getProposals());
           });
       });
   
       describe("get winning", () => {
           it("get winning proposal count", async () => {
               const contract = new ethers.Contract(contractAddress, contractABI, provider);
               console.log("winning proposals is ", await contract.winningProposal());
           });
       });
   
   
   });
   ```

3. 执行添加提案、删除提案后查看是否有事件反馈

   **新提案创建:  游泳**

   **删除提案:  10n**