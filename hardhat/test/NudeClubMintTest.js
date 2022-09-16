const { expect } = require("chai");
const { ethers } = require("hardhat");

const provider = ethers.provider;

// We're deploying a new contract and addresses in each test here
// This is only to test the basic functionally so far
// I've used dummy IPFS metadata here, we want to replace that with a real test set of 1000 creater passes 

describe("Nude Club creator pass minting contract", function () {
  it("User can mint NFT after mint started and number minted increments correctly", async function () {

    const [owner, addr1] = await ethers.getSigners();

    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha", "Nude Club Sarah Pass");

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
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha", "Nude Club Sarah Pass");

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
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha", "Nude Club Sarah Pass");
    
    await hardhatContract.connect(owner).startMintFunc();
    
    await expect (
        hardhatContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.09") })
        ).to.be.revertedWith("Not enough eth sent");

  });

  it("Ensure only owner can start the mint", async function () {
  
    const [owner, addr1] = await ethers.getSigners();
    
    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");
    
    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha", "Nude Club Sarah Pass");
      
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
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha", "Nude Club Sarah Pass");
      
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

  it("Users can mint up to 1000 NFTs and no more", async function () {

    const [owner, addr1] = await ethers.getSigners();

    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha", "Nude Club Sarah Pass");

    // Only owner can start the mint 
    await hardhatContract.connect(owner).startMintFunc();

    // Check max number of passes is 1000
    expect(await hardhatContract.maxTokenIds()).to.equal(1000);

    // Confirm no passes minted yet
    expect(await hardhatContract.tokenIds()).to.equal(0);

    // Loop through mint function 1000 times
    for (let i = 0; i < 1000; i++) {
      await hardhatContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });
    }

    // Confirm 1000 passes minted
    expect(await hardhatContract.tokenIds()).to.equal(1000);

    // Try to mint one more which should throw a fail
    await expect (
      hardhatContract.connect(addr1).mintPass({value : ethers.utils.parseEther("0.1") })
    ).to.be.revertedWith("All passes minted");

    // Confirm still 1000 passes minted
    expect(await hardhatContract.tokenIds()).to.equal(1000);

  });

  it("Ensure correct amount of eth is withdrawn after some passes are minted", async function () {

    const [owner, addr1] = await ethers.getSigners();

    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const hardhatContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha", "Nude Club Sarah Pass");

    // Only owner can start the mint 
    await hardhatContract.connect(owner).startMintFunc();

    // Confirm no passes minted yet
    expect(await hardhatContract.tokenIds()).to.equal(0);

    // Get balance of owner
    const ownerBalance = ethers.BigNumber.from(await provider.getBalance(owner.address));

    // Confirm bignumber converion works ok
    expect(await provider.getBalance(owner.address)).to.equal(ownerBalance);

    // Loop through mint function 100 times
    for (let i = 0; i < 100; i++) {
      await hardhatContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });
    }

    // Confirm 100 passes minted
    expect(await hardhatContract.tokenIds()).to.equal(100);

    // Withdraw as owner and calculate gas cost
    txResp = await hardhatContract.connect(owner).withdraw();
    txReceipt = await txResp.wait();
    withdrawGas = ethers.BigNumber.from(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice));

    // Assign 10eth value to variable
    // wei to eth conversion is 1wei * 10**18 = 1eth
    const tenETH = ethers.BigNumber.from("10000000000000000000");
    // Subtract gas cost from ETH withdrawn
    const withdrawAmountMinusGastCost = tenETH.sub(withdrawGas);

    // ETH in owner wallet should now equal the ETH withdrawn minus the gas cost
    expect(await provider.getBalance(owner.address)).to.equal(ownerBalance.add(withdrawAmountMinusGastCost));
  });

});