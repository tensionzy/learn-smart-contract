const { ethers, upgrades } = require("hardhat");

async function main() {
    // 部署可升级合约
    const upgradeableFactory = await ethers.getContractFactory("Upgradeable");
    const upgradeableContract = await upgrades.deployProxy(upgradeableFactory, [42], {initializer: "initialize"});
    console.log("upgradeableContract deployed to:", upgradeableContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });