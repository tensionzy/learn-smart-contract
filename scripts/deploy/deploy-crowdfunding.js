const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying crowdfunding contracts with the account:", deployer.address);

    const targetAmount = 1;
    const durationMinutes = 60;

    // const crowdfundingFactory = await ethers.getContractFactory("Crowdfunding");
    // const crowdfundingContract = await upgrades.deployProxy(crowdfundingFactory, [targetAmount, durationMinutes], {initializer: "initialize"});
    // await crowdfundingContract.waitForDeployment();
    // console.log("crowdfunding address:", await crowdfundingContract.getAddress());

    const upgradeableContractAddress = "0xa39Cb2466F6CeffC7D7Aae143A2c173811036FAE";
    const upgradeableV2Factory = await ethers.getContractFactory("Crowdfunding");
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
