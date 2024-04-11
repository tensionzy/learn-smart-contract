const { ethers, upgrades } = require("hardhat");

async function main() {
    const upgradeableContractAddress = "0x4954FaAf3612117578F1E75262799157Cc2C2541";
    const upgradeableV2Factory = await ethers.getContractFactory("UpgradeableV2");
    const upgradeableV2Contract = await upgrades.upgradeProxy(upgradeableContractAddress, upgradeableV2Factory);
    await upgradeableV2Contract.waitForDeployment();
    console.log("UpgrateableContract upgraded to V2 at:", await upgradeableV2Contract.getAddress());
}

main();