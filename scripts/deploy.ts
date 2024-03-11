import { ethers } from "hardhat";

async function main() {
  const Create = await ethers.getContractFactory("Create");

  const create = await Create.deploy();
  await create.waitForDeployment();

  //console.log(create);

  console.log("Create contract deployed to:", create.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
