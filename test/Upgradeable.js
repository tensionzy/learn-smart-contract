// 引入必要的库
const { expect } = require("chai");
const { JsonRpcProvider, FetchRequest } = require('ethers');
const { HttpsProxyAgent } = require('https-proxy-agent');
require('dotenv').config();
const { PROXY_URL, PRIVATE_KEY, FETCH_REQUEST } = process.env;

// 代理服务器地址, 中国需要通过代理连接到BSC测试网
const fetchReq = new FetchRequest(FETCH_REQUEST);
fetchReq.getUrlFunc = FetchRequest.createGetUrlFunc({ agent: new HttpsProxyAgent(PROXY_URL) });
const provider = new JsonRpcProvider(fetchReq);
const contractAddress = "0x4954FaAf3612117578F1E75262799157Cc2C2541";
const contractABI = [
  "function value() view returns (uint256)",
  "function setName(string _name)",
  "function name() view returns (string)"
];
describe("upgradeable contract", function () {

  describe("get upgradeable contract value", function () {
    it("upgradeable value check", async function () {
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const value = await contract.value();
      console.log("upgradeable contract value is ", value);
      expect(value).to.equal(42);
    });
  });

  describe("upgradeable v2 name test", function () {
    // 测试中发送交易需要使用一个签名者来创建合约实例
    it("upgradeable v2 set name", async function () {
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const txResponse = await contract.setName("upgrade contract v2");
      const receipt = await txResponse.wait();
      console.log(receipt);
    });

    it("upgradeable v2 get name", async function () {
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const name = await contract.name();
      console.log("upgradeable contract name is ", name);
      expect(name).to.equal("upgrade contract v2");
    });
  });
});