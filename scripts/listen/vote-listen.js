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