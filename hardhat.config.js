require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

const { PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.21",
  networks: {
    bsctestnet: {
      url: "https://data-seed-prebsc-2-s1.bnbchain.org:8545/",
      accounts: [PRIVATE_KEY].filter(Boolean)
    }
  }
};