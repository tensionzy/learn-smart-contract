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