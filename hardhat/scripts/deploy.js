const { ethers, upgrades } = require("hardhat");

async function main() {

  const NudeClubMintContract = await ethers.getContractFactory("NudeClubMint");

  const deployedContract = await NudeClubMintContract.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha", 
            "Nude Club Creator Pass Test Mint");

  await deployedContract.deployed();

  console.log(
    "NudeClubMint contract address: ",
    deployedContract.address
  );


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
