// 引入必要的库
const { expect } = require("chai");
const { JsonRpcProvider, FetchRequest } = require('ethers');
const { HttpsProxyAgent } = require('https-proxy-agent');
require('dotenv').config();

// 代理服务器地址, 中国需要通过代理连接到BSC测试网
const proxyUrl = 'http://127.0.0.1:7890'; 
// BSC测试网
const fetchReq = new FetchRequest("https://data-seed-prebsc-1-s1.binance.org:8545/");
fetchReq.getUrlFunc = FetchRequest.createGetUrlFunc({ agent: new HttpsProxyAgent(proxyUrl) });
const provider = new JsonRpcProvider(fetchReq);
const contractAddress = "0xEc3Fe840fE40F1Df344eA16B44e1fB19A04a31e4";
const contractABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint)",
  "function owner() view returns (address)",
  "function mint(address to, uint256 amount)"
];

describe("contract interaction", function() {
  describe("mint token", function () {
    it("mint 1000 KuiToken", async function() {
      const { PRIVATE_KEY } = process.env;
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const owner = await contract.owner();
      const txResponse = await contract.mint(owner, 1000);
      const receipt = await txResponse.wait();
      console.log(receipt);
    })
  })
  
  describe("contract owner address check", function () {
    it("should set the right owner", async function () {
      const { PRIVATE_KEY } = process.env;
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);
      const walletAddress = await signer.getAddress();

      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const owner = await contract.owner();
      // 验证合约部署者即为代币的所有者
      console.log("contract owner address is %s, wallet address is %s", owner, walletAddress);
      expect(owner).to.equal(walletAddress);
    });
  });

  describe("get balance", function() {
    it("should return the balance", async function() {
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const owner = await contract.owner();
      const userKuiTokenBalance = await contract.balanceOf(owner);
      // 输出用户余额
      console.log('user kui token balance is: %s', userKuiTokenBalance);
      // 输出合约余额
      const contractKuiTokenBalance = await contract.balanceOf(contractAddress);
      console.log('contract balance is: %s', contractKuiTokenBalance)
      // 这里你可以添加一些断言，例如验证余额是否符合预期
      // expect(balance).to.equal(expectedBalance);
    });
  });
});