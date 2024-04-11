const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying voting contracts with the account:", deployer.address);

    // 以下日期需要转换为Unix时间戳
    // const startTime = new Date("2024-04-01").getTime() / 1000;
    // const endTime = new Date("2024-12-30").getTime() / 1000;
    // const proposalNames = ["踢足球", "打篮球", "跳舞", "画画", "唱歌", "学习", "看书", "玩游戏", "看电视"];

    // const votingFactory = await ethers.getContractFactory("Voting");
    // const votingContract = await upgrades.deployProxy(votingFactory, [proposalNames, "小葵最喜欢的事情", "小葵最喜欢的事投票", startTime, endTime], {initializer: "initialize"});
    // await votingContract.waitForDeployment();
    // console.log("voting address:", await votingContract.getAddress());

    const upgradeableContractAddress = "0x9F48a6B286935F268dd5c33FF3d0c7CbFd83Cb7C";
    const upgradeableV2Factory = await ethers.getContractFactory("Voting");
    const upgradeableV2Contract = await upgrades.upgradeProxy(upgradeableContractAddress, upgradeableV2Factory);
    await upgradeableV2Contract.waitForDeployment();
    console.log("UpgrateableContract upgraded to next version at:", await upgradeableV2Contract.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
