require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  networks:{
    ganache:{
      url: `HTTP://127.0.0.1:7545`,
      accounts: [`9d46610922d487586b885d5407343a8f99504f28f33c89ab2f56bf8c41db7bea`],
    }
  },
  mocha: {
    timeout: 70000//test timeout in ms
  }
};
