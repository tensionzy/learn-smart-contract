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

	// describe("Balance", function () {
  //   it("Should return the balance of the contract", async function () { 
  //     const contractBalance = await ethers.provider.getBalance(myContract.address);
  //     expect(contractBalance).to.equal(ethers.utils.parseEther("1.0"));
  //   });
  // });
});