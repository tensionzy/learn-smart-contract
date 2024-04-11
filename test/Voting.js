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
    describe("add proposal", () => {
      it("add proposal '游泳'", async () => {
        const signer = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        await contract.addProposal("游泳");
      });
    });
    
    // describe("del proposals", () => {
    //     it("del last proposals", async () => {
    //         const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    //         const contract = new ethers.Contract(contractAddress, contractABI, signer);
    //         await contract.delProposal(10);
    //     });
    // });

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