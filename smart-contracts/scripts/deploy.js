
const hre = require("hardhat");

async function main() {
  const ElectionManager = await hre.ethers.getContractFactory("ElectionManager");
  const electionManager = await ElectionManager.deploy();

  await electionManager.deployed();

  console.log("Election Manager deployed to:", electionManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
