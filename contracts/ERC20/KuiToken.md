# 学习开发代币

---

## 一、环境准备

安装Node.js和npm（Node包管理器）

使用Hardhat来构建项目，Hardhat是一个非常流行的以太坊开发环境，提供了编译、部署、测试以及调试智能合约的全套工具。确保安装Node.js和npm

```shell
npm install --save-dev hardhat
```

## 二、初始化Hardhat项目

```shell
npx hardhat
```

跟随提示选择“Create a basic sample project”来创建一个简单的示例项目，或者根据个人偏好选择其他选项。此命令将创建Hardhat配置文件`hardhat.config.js`，以及一些示例合约和测试脚本。

## 三、创建代币合约

在`contracts`目录下创建一个新的Solidity文件，例如`KuiToken.sol`，并编写你的代币合约代码。你可以遵循ERC-20标准，以下是一个非常基础的ERC-20代币实现示例：

```solidity
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
}
```

这段代码利用了OpenZeppelin的ERC20合约来简化开发。如果你的项目中还没有OpenZeppelin库，可以通过npm安装：

```shell
npm install @openzeppelin/contracts
```

## 四、编译合约

使用Hardhat编译你的智能合约：

```shell
npx hardhat compile
```

## 五、测试合约

写一个简单的测试用例来测试 `KuiToken` 合约，主要可以包括以下几个步骤：

1. **部署合约**：首先，你需要在测试中部署你的 `KuiToken` 合约。
2. **检查初始供应量**：验证合约部署后的初始供应量是否正确。
3. **转账测试**：测试代币从一个账户转移到另一个账户的功能。
4. **余额查询**：验证账户的代币余额是否正确。

```javascript
const { expect } = require("chai");

describe("KuiToken contract", function () {
  let KuiToken;
  let kuiToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // 获取合约的工厂和签名者
    KuiToken = await ethers.getContractFactory("KuiToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // 部署合约，初始供应量为1000个代币
    kuiToken = await KuiToken.deploy(1000);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      // 验证合约部署者即为代币的所有者
      expect(await kuiToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      // 验证合约部署者获得了所有的初始供应量
      const ownerBalance = await kuiToken.balanceOf(owner.address);
      expect(await kuiToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // 从合约所有者转移代币到addr1
      await kuiToken.transfer(addr1.address, 50);
      const addr1Balance = await kuiToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // 从addr1转移代币到addr2
      await kuiToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await kuiToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});
```

执行测试用例，查看测试结果

```shell
npx hardhat test ./test/KuiToken.js
```



## 六、部署合约

### 6.1 部署到BSC测试环境

#### 6.1.1 配置Hardhat环境

首先，确保你的`hardhat.config.js`文件配置了BSC测试网的网络信息。你需要添加BSC测试网的RPC URL和你的账户私钥（用于部署合约的账户）。为了获取BSC测试网的RPC URL，你可以使用公共RPC如Ankr提供的，或者在Binance Smart Chain的官方文档中找到其他提供者。

```javascript
require("@nomiclabs/hardhat-waffle");

const privateKey = 'your-private-key-here'; // 替换为你的私钥

module.exports = {
  solidity: "0.8.4",
  networks: {
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [privateKey]
    }
  }
};
```

请确保不要将你的私钥硬编码到脚本或提交到版本控制中，以避免安全风险。一种常见做法是使用环境变量管理私钥

#### 6.1.2 获取测试网BNB

部署合约到BSC测试网需要消耗BNB作为gas费用。你可以通过BSC测试网的水龙头获取免费的测试网BNB。访问Binance Smart Chain的水龙头网站（如https://testnet.binance.org/faucet-smart），输入你的测试网地址，申请测试币。

#### 6.1.3  编写部署脚本

```javascript
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Token = await ethers.getContractFactory("KuiToken");
  const token = await Token.deploy(1000000);

  console.log("Token address:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

#### 6.1.4 部署合约

使用Hardhat在本地环境或测试网络上部署合约：

```shell
npx hardhat run scripts/deploy.js --network bsctestnet
```

#### 6.1.5 验证合约

部署完成后，你可能希望在BSC的区块链浏览器上验证和发布你的合约源代码，这样其他人就可以查看你的合约代码并与之交互。你可以访问BSC的测试网区块链浏览器，找到你的合约地址，并按照网站上的指示上传源代码进行验证。

BSC的测试网区块链浏览器地址：https://testnet.bscscan.com/

### 6.2 部署到BSC正式环境

。。。

## 七、与合约交互

编写测试用例与智能合约交互

```javascript
const { expect } = require("chai");
const { JsonRpcProvider, FetchRequest } = require('ethers');
const { HttpsProxyAgent } = require('https-proxy-agent');

describe("Token Balance", function() {
  it("Should return the token balance of the account", async function() {
    // 代理服务器地址
    const proxyUrl = 'http://127.0.0.1:7890'; 
    // 需要通过代理连接到BSC测试网
    const fetchReq = new FetchRequest("https://data-seed-prebsc-1-s1.binance.org:8545/");
    fetchReq.getUrlFunc = FetchRequest.createGetUrlFunc({ agent: new HttpsProxyAgent(proxyUrl) });
    const provider = new JsonRpcProvider(fetchReq);

    // 使用合约的ABI和地址创建一个合约实例
    const contractAddress = "你所部署的合约地址";
    const contractABI = [
      // balanceOf
			{
				constant: true,
				inputs: [{ name: "_owner", type: "address" }],
				name: "balanceOf",
				outputs: [{ name: "balance", type: "uint256" }],
				type: "function",
			},
    ];
    const tokenContract = new ethers.Contract(contractAddress, contractABI, provider);

    // 查询账户的Token余额
    const accountAddress = "你的账户地址";
    const balance = await tokenContract.balanceOf(accountAddress);

    // 输出余额（可选）
    console.log(`The balance of account ${accountAddress} is: ${balance.toString()}`);

    // 这里你可以添加一些断言，例如验证余额是否符合预期
    // expect(balance).to.equal(expectedBalance);
  });
});
```