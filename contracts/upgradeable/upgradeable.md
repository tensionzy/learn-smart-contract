# 可升级合约

---

## 一、理解代理模式

代理模式在智能合约开发中是一种使智能合约可升级的设计模式。本质上，它允许智能合约的逻辑部分在不更改合约地址或其存储状态的情况下进行修改和升级。这种模式解决了智能合约一旦部署就不能更改的限制，为修复漏洞、添加功能或优化合约逻辑提供了可能。

### 1.1 代理模式的工作原理

代理模式涉及至少两个合约：一个**代理合约**和一个或多个**逻辑合约**（有时称为实现合约）。

* **代理合约**：用户与其他合约与之交互，它负责将所有调用转发到当前的逻辑合约。它保持不变，这意味着合约地址和存储的数据（例如用户的余额）随着时间的推移保持不变。
* **逻辑合约**：包含实际业务逻辑的合约（例如，如何转移代币、如何更新数据等）。逻辑合约可以有多个版本，随着新版本的部署，代理合约可以被配置为指向最新的逻辑合约。

### 1.2 代理模式的关键特性

* **可升级性**：可以通过部署新的逻辑合约版本来更新智能合约的逻辑，而无需改变代理合约的地址或其存储的数据。
* **透明性**：对于用户来说，代理合约的存在是透明的，他们不需要知道背后的逻辑被更新了。
* **数据保留**：由于状态数据存储在代理合约中，因此即使逻辑合约发生变化，数据也会保留下来。

### 1.3 代理模式的类型

* **透明代理（Transparent Proxy）**：区分了普通用户和管理员的调用，防止管理员直接调用逻辑合约的功能。
* **UUPS（Universal Upgradeable Proxy Standard）**：在逻辑合约中包含升级逻辑，这样就不需要为代理合约编写专门的升级功能，简化了升级过程。

### 1.4 注意事项

- **安全性**：使用代理模式时，需要格外注意安全问题，因为错误的实现可能会导致严重的安全漏洞。
- **复杂性**：代理模式增加了智能合约系统的复杂性，需要更细致的测试和验证确保一切正常工作。

### 1.5 代理合约的基本功能

代理合约在可升级智能合约系统中起着至关重要的作用，它不仅仅是作为逻辑合约的一个前端接口，还提供了一系列关键功能来支持合约的升级性、安全性和灵活性。下面是一些代理合约一般具备的功能：

* **调用转发（Call Forwarding）**

  代理合约的主要功能是将接收到的调用转发给后端的逻辑合约。它使用`delegatecall`（或类似的底层操作），这样做可以保持调用的上下文（包括调用者的地址和发送的值）不变，并允许逻辑合约操作代理合约的存储。

* **存储维护（Storage Maintenance）**

  尽管逻辑合约的代码可以更改，但所有的状态变量都存储在代理合约中，这保证了数据的持久性。代理合约需要维护一个兼容的存储布局，以兼容旧的和新的逻辑合约版本。

* **升级管理（Upgrade Management）**

  代理合约通常包含管理合约升级的逻辑，这包括指向新逻辑合约的地址。在安全的升级模式下，这通常涉及到一系列的权限检查，确保只有授权的账户（如合约的所有者或治理机制）可以执行升级。

* **权限控制（Access Control）**

  为了防止未授权的修改，代理合约通常会实现访问控制机制。这可能是基于角色的访问控制（RBAC），或简单的所有权模型，确保只有特定的用户（如管理员）能够更改代理指向的逻辑合约。

* **初始化逻辑（Initialization Logic）**

  在首次升级或部署逻辑合约时，可能需要初始化状态变量。代理合约可以包含初始化逻辑或函数，用于在部署新的逻辑合约时设置初始状态。

* **透明代理（Transparent Proxy）**

  为了防止用户直接与逻辑合约交互（绕过代理合约），代理合约可能实现透明代理功能。这意味着合约会区分管理调用（例如升级合约）和普通调用，只有通过代理合约的管理调用才能修改指向的逻辑合约地址或执行其他管理操作。

* **事件发射（Event Emission）**

  虽然事件日志是在逻辑合约中定义的，但实际上它们是由代理合约发射的，因为`delegatecall`操作使得逻辑合约的代码在代理合约的上下文中运行。这样做保证了事件日志与合约的持久地址相关联，方便追踪和监听。

* **回退函数（Fallback Function）**

  代理合约通常会有一个回退函数或接收器，用于处理直接发送到合约地址的以太币和未匹配到任何函数签名的调用。这个函数也负责将这些调用或资金转发给逻辑合约。

## 二、实现可升级合约

代理模式主要通过`delegatecall`操作码实现。`delegatecall`允许代理合约调用另一个合约的函数，同时保持自己的上下文（即`msg.sender`和`msg.value`不变）和存储。这意味着，即使是逻辑合约的代码在执行，状态变量的更改也发生在代理合约中，而不是逻辑合约本身。

### 2.1 安装OpenZeppelin 合约库

```shell
npm install @openzeppelin/contracts-upgradeable
```

### 2.2 可升级合约

我们定义一个简单的可升级合约，这个合约包含一些基础逻辑，比如存储一个数值并允许更改它：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Upgradeable is Initializable {
    uint256 public value;

    function initialize(uint256 _value) public {
        value = _value;
    }

    function setValue(uint256 _value) public {
        value = _value;
    }
}
```

### 2.3 部署可升级合约

#### 2.3.1 安装@openzeppelin/hardhat-upgrades

```shell
npm install @openzeppelin/hardhat-upgrades
```

#### 2.3.2 在hardhat.config.js中引入@openzeppelin/hardhat-upgrades插件

打开你的`hardhat.config.js`文件，确保你已经引入了`@openzeppelin/hardhat-upgrades`插件。如果没有，请添加如下代码：

```javascript
require('@openzeppelin/hardhat-upgrades');
```

#### 2.3.3 编写部署脚本

```javascript
const { ethers, upgrades } = require("hardhat");

async function main() {
    // 部署可升级合约
    const upgradeableFactory = await ethers.getContractFactory("Upgradeable");
    const upgradeableContract = await upgrades.deployProxy(upgradeableFactory, [42], {initializer: "initialize"});
    await upgradeableContract.deployed();
    console.log("upgradeableContract deployed to:", upgradeableContract.address);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});
```

这个脚本使用Hardhat的`upgrades`插件部署了一个可升级的代理合约，并且初始化了存储的值为`42`。

#### 2.3.4 运行部署脚本

```shell
npx hardhat run scripts/deploy-upgradeable.js --network bsctestnet
```

### 2.4  可升级合约V2

新版本`UpgradeableV2`在末尾添加了一个新的状态变量`name`，这是兼容存储布局的一个示例。当使用 OpenZeppelin 插件进行升级时，它会帮助确保这种兼容性。

```solidity
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

    function setname(string _name) {
        name = _name;
    }
}
```

### 2.5 部署可升级合约V2

使用 OpenZeppelin Hardhat 插件的 `upgradeProxy` 函数来升级现有的代理合约实例到新版本的逻辑合约。

```javascript
const { ethers, upgrades } = require("hardhat");

async function main() {
    const upgradeableContractAddress = "YOUR_DEPLOYED_UPGRADEABLE_CONTRACT_ADDRESS";
    const upgradeableV2Factory = await ethers.getContractFactory("UpgradeableV2");
    const upgradeableV2Contract = await upgrades.upgradeProxy(upgradeableContractAddress, upgradeableV2Factory);
    console.log("UpgrateableContract upgraded to V2 at:", upgradeableV2Contract.address);
}

main();
```

### 2.6 注意事项

- 确保新版本的逻辑合约兼容旧版本的存储布局。
- 进行任何升级之前，应在测试网络上充分测试新的合约版本。
- 考虑执行合约的安全审计，尤其是在主网部署之前。