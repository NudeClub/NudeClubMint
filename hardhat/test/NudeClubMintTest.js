const { expect } = require("chai");
const { ethers } = require("hardhat");

const provider = ethers.provider;

// We're deploying a new contract and addresses in each test here
// This is only to test the basic functionally so far

describe("Nude Club creator pass minting contract", function () {
  it("User can mint NFT after mint started and number minted increments correctly", async function () {

    const [owner, addr1] = await ethers.getSigners();

    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha");

    // Only owner can start the mint 
    await hardhatContract.startMintFunc();

    // Confirm no passes minted yet
    expect(await hardhatContract.tokenIds()).to.equal(0);

    // Happy path - owner sucessfully mints 1 nude club pass for this collection
    await hardhatContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });

    // Confirm one pass minted
    expect(await hardhatContract.tokenIds()).to.equal(1);

    // Check max number of passes is 1000
    expect(await hardhatContract.maxTokenIds()).to.equal(1000);

  });

  it("User cannot mint NFT before mint started", async function () {

    const [owner, addr1] = await ethers.getSigners();

    
    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha");

    // Try and mint an NFT before the owner has started minting
    await expect (
        hardhatContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") })
        ).to.be.revertedWith("Mint not active");

    // Only owner can start the mint 
    await hardhatContract.connect(owner).startMintFunc();

    // Mint now occurs successfully
    await hardhatContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });

  });

  it("User cannot mint NFT with less than 0.1eth", async function () {

    const [owner, addr1] = await ethers.getSigners();

    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha");
    
    await hardhatContract.connect(owner).startMintFunc();
    
    await expect (
        hardhatContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.09") })
        ).to.be.revertedWith("Not enough eth sent");

  });

  it("Ensure only owner can start the mint", async function () {
  
    const [owner, addr1] = await ethers.getSigners();
    
    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");
    
    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha");
      
    // Try to start mint as non-owner 
    await expect (
        hardhatContract.connect(addr1).startMintFunc() 
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // Try and mint an NFT before the owner has started minting
    await expect (
        hardhatContract.connect(owner).mintPass({ value: ethers.utils.parseEther("0.1") })
        ).to.be.revertedWith("Mint not active");

    // Confirm no passes minted yet
    expect(await hardhatContract.tokenIds()).to.equal(0);

    // Start mint as owner
    hardhatContract.startMintFunc() 

    // Happy path - owner sucessfully mints 1 nude club pass for this collection
    await hardhatContract.connect(owner).mintPass({ value: ethers.utils.parseEther("0.1") });

    // Confirm one pass minted
    expect(await hardhatContract.tokenIds()).to.equal(1);

  });

  it("Ensure only owner can withdraw", async function () {
  
    const [owner, addr1] = await ethers.getSigners();
    
    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");
    
    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha");
      
    // Start mint as owner 
    await hardhatContract.connect(owner).startMintFunc() 

    // Try and mint an NFT 
    await hardhatContract.connect(owner).mintPass({ value: ethers.utils.parseEther("0.1") });

    // Confirm one NFT minted
    expect(await hardhatContract.tokenIds()).to.equal(1);

    // Try to withdraw eth not as owner 
    await expect (
      hardhatContract.connect(addr1).withdraw() 
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // Try to withdraw as owner (will throw fail if txn fails)
    await hardhatContract.connect(owner).withdraw();

  });

});