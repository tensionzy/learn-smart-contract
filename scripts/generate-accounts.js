// generateAccounts.js
const { ethers } = require('ethers');
const { JsonRpcProvider, FetchRequest } = require('ethers');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 代理服务器地址, 中国需要通过代理连接到BSC测试网
const proxyUrl = 'http://127.0.0.1:7890'; 
// BSC测试网
const fetchReq = new FetchRequest("https://data-seed-prebsc-2-s1.bnbchain.org:8545/");
fetchReq.getUrlFunc = FetchRequest.createGetUrlFunc({ agent: new HttpsProxyAgent(proxyUrl) });
const provider = new JsonRpcProvider(fetchReq);

async function generateAccounts() {
    let accounts = [];
    
    for (let i = 0; i < 7; i++) {
        const wallet = ethers.Wallet.createRandom().connect(provider);
        accounts.push({
            address: wallet.address,
            privateKey: wallet.privateKey
        });
    }
    console.log("test accounts is ", accounts);

    // 保存账户信息到文件
    fs.writeFileSync(path.join(__dirname, 'test-accounts.json'), JSON.stringify(accounts, null, 2));
    return accounts;
}

async function fundAccounts() {
    const accounts = require('./test-accounts.json');
    // 此处应该使用拥有BNB的钱包来分配测试BNB
    const { PRIVATE_KEY } = process.env;
    const funderWallet = new ethers.Wallet(PRIVATE_KEY, provider);

    for (const account of accounts) {
        try {
            const response = await funderWallet.sendTransaction({
                to: account.address,
                value: ethers.parseEther("0.01")
            });
            // 等待交易被确认
            const receipt = await response.wait();
            console.log('交易已在区块中确认:', receipt.blockNumber);
        } catch (error) {
            console.error('发送交易或等待确认时出错:', error);
            // 可以在这里添加错误处理逻辑，例如重试发送交易
        }
    }
}

async function main() {
    await generateAccounts();
    await fundAccounts();
}

main();
