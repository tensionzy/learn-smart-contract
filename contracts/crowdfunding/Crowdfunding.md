# 众筹智能合约

---

## 一、目的

众筹智能合约的基本思路围绕着资金的安全收集、条件判断以及最终的资金分配。以下是实现此功能的一种简化逻辑框架，以帮助你理解合约中的资金流动和条件逻辑。

* **初始化众筹合约**
  - **设定目标金额**：在合约创建时，定义一个目标金额，这是项目需要达到的资金目标。
  - **设定截止时间**：设定一个众筹截止日期，只有在这个日期之前收到的资金才会被计入众筹。
  - **项目所有者**：设定项目所有者的地址。如果众筹成功，资金将转给这个地址。
* **资金贡献逻辑**
  - **接收资金**：允许用户向合约发送资金以参与众筹。每次收到资金时，记录贡献者的地址及其贡献金额。
  - **记录贡献**：合约需要跟踪每个贡献者的贡献总额，以便在必要时退款。
* **判断逻辑与执行**
  * **达到目标**：如果在截止日期前众筹总金额达到或超过目标金额，则触发成功逻辑。
  * **资金转移**：将收集到的资金转移到项目所有者的地址。
  * **未达到目标**：如果截止日期到达时未能达到目标金额，则触发失败逻辑。
  * **退款逻辑**：为每个贡献者执行退款操作，将其贡献的资金退回。
* **安全性与优化**
  * **防止重入攻击**：确保合约的资金转移操作不会受到重入攻击，特别是在退款操作中。
  * **优化气费**：优化合约代码以减少贡献者和项目所有者执行交易时的气费成本。
  * **合约权限**：确保只有合约创建者或授权人员能修改关键参数，如截止日期和目标金额。
* **结束条件**
  * **合约结束**：一旦众筹成功或所有退款完成，合约可以设定为结束状态，防止进一步的资金贡献。

## 二、实现众筹合约

* 安装Hardhat

  ```shell
  npm install --save-dev hardhat
  ```

* 安装OpenZeppelin Contracts:

  ```
  npm install @openzeppelin/contracts
  npm install @openzeppelin/contracts-upgradeable
  ```

  

在`contracts`目录下创建一个新的Solidity文件，比如叫`Crowdfunding.sol`，实现基础的众筹逻辑，包括贡献资金、达到目标后的资金提取以及未达到目标时的退款。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Crowdfunding is Initializable, ReentrancyGuard {
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
}

```

## 三、测试

编写测试用例

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
const contractAddress = "0xa39Cb2466F6CeffC7D7Aae143A2c173811036FAE";
const contractABI = [
    `function contribute()`,
    `function totalContributed() view returns (uint)`,
    `function extendDeadline(uint additionalMinutes)`,
    `function withdrawFunds()`
];
describe("crowdfunding contract", function () {
    // describe("contribute function", () => {
    //     it("test accounts for crowdfunding", async () => {
    //         for (let i = 0; i < testAccounts.length; i++) {
    //             const testAccount = testAccounts[i];
    //             const privateKey = testAccount.privateKey;
    //             console.log("account private key is ", privateKey);
    //             const signer = new ethers.Wallet(privateKey, provider);
    //             const contract = new ethers.Contract(contractAddress, contractABI, signer);
    //             console.log(contract);
    //             const txResponse = await contract.contribute({value: ethers.parseEther("0.001")});
    //             // 等待交易确认
    //             await txResponse.wait();
    //         }
    //     });
    // });

    describe("withdrawFunds", () => {
        it("withdrawFunds", async () => {
            const signer = new ethers.Wallet(PRIVATE_KEY, provider);
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            await contract.withdrawFunds();
        });
    });

    describe("total contributed", () => {
        it("get total contributed", async () => {
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const totalContributed = await contract.totalContributed();
            console.log("total contributed is ", ethers.formatEther(totalContributed));
        });
    });
});
```

