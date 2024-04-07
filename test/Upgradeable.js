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
const contractAddress = "0x4954FaAf3612117578F1E75262799157Cc2C2541";
const contractABI = [
  "function value() view returns (uint256)",
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
});