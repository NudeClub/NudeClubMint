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
    const NudeClubMintContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/", "Nude Club Sarah Pass", "0xA6Ed81c27942DA2AE0aB8024d3e16305eAEa1bC2");

    // Only owner can start the mint 
    await NudeClubMintContract.startMintFunc();

    // Confirm no passes minted yet
    expect(await NudeClubMintContract.tokenIds()).to.equal(0);

    // Happy path - owner sucessfully mints 1 nude club pass for this collection
    await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });

    // Confirm one pass minted
    expect(await NudeClubMintContract.tokenIds()).to.equal(1);

    // Check max number of passes is 1000
    expect(await NudeClubMintContract.maxTokenIds()).to.equal(1000);

  });


  it("NFT amount correct on account", async function () {

    const [owner, addr1] = await ethers.getSigners();

    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const NudeClubMintContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/", "Nude Club Sarah Pass", "0xA6Ed81c27942DA2AE0aB8024d3e16305eAEa1bC2");

    // Only owner can start the mint 
    await NudeClubMintContract.startMintFunc();

    // Address one should not have any NFTs yet
    expect(await NudeClubMintContract.balanceOf(addr1.address)).to.equal(0);

    // Happy path - owner sucessfully mints 1 nude club pass for this collection
    await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });

    // Check count
    expect(await NudeClubMintContract.balanceOf(addr1.address)).to.equal(1);

    // Mint another
    await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });

    expect(await NudeClubMintContract.balanceOf(addr1.address)).to.equal(2);
    
    await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });

    expect(await NudeClubMintContract.balanceOf(addr1.address)).to.equal(3);
  })

  it("User cannot mint NFT before mint started", async function () {

    const [owner, addr1] = await ethers.getSigners();

    
    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const NudeClubMintContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/", "Nude Club Sarah Pass", "0xA6Ed81c27942DA2AE0aB8024d3e16305eAEa1bC2");

    // Try and mint an NFT before the owner has started minting
    await expect (
        NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") })
        ).to.be.revertedWith("Mint not active");

    // Only owner can start the mint 
    await NudeClubMintContract.connect(owner).startMintFunc();

    // Mint now occurs successfully
    await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });

  });

  it("User cannot mint NFT with less than 0.1eth", async function () {

    const [owner, addr1] = await ethers.getSigners();

    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const NudeClubMintContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/", "Nude Club Sarah Pass", "0xA6Ed81c27942DA2AE0aB8024d3e16305eAEa1bC2");
    
    await NudeClubMintContract.connect(owner).startMintFunc();
    
    await expect (
        NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.09") })
        ).to.be.revertedWith("Not enough eth sent");

  });

  it("Ensure only owner can start the mint", async function () {
  
    const [owner, addr1] = await ethers.getSigners();
    
    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");
    
    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const NudeClubMintContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/", "Nude Club Sarah Pass", "0xA6Ed81c27942DA2AE0aB8024d3e16305eAEa1bC2");
      
    // Try to start mint as non-owner 
    await expect (
        NudeClubMintContract.connect(addr1).startMintFunc() 
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // Try and mint an NFT before the owner has started minting
    await expect (
        NudeClubMintContract.connect(owner).mintPass({ value: ethers.utils.parseEther("0.1") })
        ).to.be.revertedWith("Mint not active");

    // Confirm no passes minted yet
    expect(await NudeClubMintContract.tokenIds()).to.equal(0);

    // Start mint as owner
    NudeClubMintContract.startMintFunc() 

    // Happy path - owner sucessfully mints 1 nude club pass for this collection
    await NudeClubMintContract.connect(owner).mintPass({ value: ethers.utils.parseEther("0.1") });

    // Confirm one pass minted
    expect(await NudeClubMintContract.tokenIds()).to.equal(1);

  });

  it("Ensure only owner can withdraw", async function () {
  
    const [owner, addr1] = await ethers.getSigners();
    
    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");
    
    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const NudeClubMintContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/", "Nude Club Sarah Pass", "0xA6Ed81c27942DA2AE0aB8024d3e16305eAEa1bC2");
      
    // Start mint as owner 
    await NudeClubMintContract.connect(owner).startMintFunc() 

    // Try and mint an NFT 
    await NudeClubMintContract.connect(owner).mintPass({ value: ethers.utils.parseEther("0.1") });

    // Confirm one NFT minted
    expect(await NudeClubMintContract.tokenIds()).to.equal(1);

    // Try to withdraw eth not as owner 
    await expect (
      NudeClubMintContract.connect(addr1).withdraw() 
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // Try to withdraw as owner (will throw fail if txn fails)
    await NudeClubMintContract.connect(owner).withdraw();

  });

  it("Users can mint up to 1000 NFTs and no more", async function () {

    const [owner, addr1] = await ethers.getSigners();

    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const NudeClubMintContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/", "Nude Club Sarah Pass", "0xA6Ed81c27942DA2AE0aB8024d3e16305eAEa1bC2");

    // Only owner can start the mint 
    await NudeClubMintContract.connect(owner).startMintFunc();

    // Check max number of passes is 1000
    expect(await NudeClubMintContract.maxTokenIds()).to.equal(1000);

    // Confirm no passes minted yet
    expect(await NudeClubMintContract.tokenIds()).to.equal(0);

    // Loop through mint function 1000 times
    for (let i = 0; i < 1000; i++) {
      await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });
    }

    // Confirm 1000 passes minted
    expect(await NudeClubMintContract.tokenIds()).to.equal(1000);

    // Try to mint one more which should throw a fail
    await expect (
      NudeClubMintContract.connect(addr1).mintPass({value : ethers.utils.parseEther("0.1") })
    ).to.be.revertedWith("All passes minted");

    // Confirm still 1000 passes minted
    expect(await NudeClubMintContract.tokenIds()).to.equal(1000);

  });

  it("Ensure correct amount of eth is withdrawn after some passes are minted", async function () {

    const [owner, addr1] = await ethers.getSigners();

    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const NudeClubMintContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/", "Nude Club Sarah Pass", owner.address);

    // Only owner can start the mint 
    await NudeClubMintContract.connect(owner).startMintFunc();

    // Confirm no passes minted yet
    expect(await NudeClubMintContract.tokenIds()).to.equal(0);

    // Get balance of owner
    const ownerBalance = ethers.BigNumber.from(await provider.getBalance(owner.address));

    // Confirm bignumber converion works ok
    expect(await provider.getBalance(owner.address)).to.equal(ownerBalance);

    // Loop through mint function 100 times
    for (let i = 0; i < 100; i++) {
      await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });
    }

    // Confirm 100 passes minted
    expect(await NudeClubMintContract.tokenIds()).to.equal(100);

    // Withdraw as owner and calculate gas cost
    txResp = await NudeClubMintContract.connect(owner).withdraw();
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

  it("tokenURI is set sucessfully", async function() {

    const [owner, addr1] = await ethers.getSigners();

    const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

    // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
    const NudeClubMintContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/", "Nude Club Sarah Pass", "0xA6Ed81c27942DA2AE0aB8024d3e16305eAEa1bC2");

    // Only owner can start the mint 
    await NudeClubMintContract.connect(owner).startMintFunc();

    const tokenURI_1 = "ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/1.json"
    const tokenURI_2 = "ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/2.json"

    await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });
    await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });

    expect(await NudeClubMintContract.tokenURI(1)).to.equal(tokenURI_1);
    expect(await NudeClubMintContract.tokenURI(2)).to.equal(tokenURI_2);

})

it("Invalid tokenURI not found", async function() {

  const [owner, addr1] = await ethers.getSigners();

  const NudeClubMint = await ethers.getContractFactory("NudeClubMint");

  // Deploy contract with dummy metadata (This will be the ipfs link for the collection)
  const NudeClubMintContract = await NudeClubMint.deploy("ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/", "Nude Club Sarah Pass", "0xA6Ed81c27942DA2AE0aB8024d3e16305eAEa1bC2");

  // Only owner can start the mint 
  await NudeClubMintContract.connect(owner).startMintFunc();

  const tokenURI_1 = "ipfs://QmSyrVNtDaXoEDEEBa6uuYVTFfPmWoLNGmgDhoU9KkPpha/1.json"

  await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });
  await NudeClubMintContract.connect(addr1).mintPass({ value: ethers.utils.parseEther("0.1") });

  await expect(
    NudeClubMintContract.tokenURI(0)
    ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");

})

});