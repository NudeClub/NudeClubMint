// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.16;

  import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
  import "@openzeppelin/contracts/access/Ownable.sol";
  import "@openzeppelin/contracts/utils/Strings.sol";

contract NudeClubMint is ERC721Enumerable, Ownable {


	/**
	* @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
	* token will be the concatenation of the `baseURI` and the `tokenId`.
	*/
	string _baseTokenURI;

	//  The price of one NFT in the mint
	uint256 public NFT_price = 0.1 ether;

	// Max number of passes we want to sell in this mint
	uint256 public maxTokenIds = 1000;
	// Number to keep track of how many are minted
	uint256 public tokenIds;
	// Flag to start the mint 
	bool startMint = false;

	/**
	* * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
	*     We can change <MODEL_NAME> here for each creator, later we can make a contract 
	*	  factory for a more scalable solution
	*/
	constructor (string memory baseURI, string memory creatorPassName) ERC721(creatorPassName, "NUDE") {
		_baseTokenURI = baseURI;
	}

	/**
	 *  Function used to begin the mint that only the owner can call
	 */
	function startMintFunc() public onlyOwner {
		startMint = true;
	}

	/**
	* @dev _baseURI overrides the Openzeppelin's ERC721 implementation which by default
	* returned an empty string for the baseURI
	*/
	function _baseURI() internal view virtual override returns (string memory) {
		return _baseTokenURI;
	}

	/**
	* @dev tokenURI overides the Openzeppelin's ERC721 implementation for tokenURI function
	* This function returns the URI from where we can extract the metadata for a given tokenId
	*/
	function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
		require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

		string memory baseURI = _baseURI();
		// Attach tokenID so it can find the token stored on IPFS
		return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json")) : "";
	}

	/**
	* @dev Allow a user to mint one NFT per transaction
	*/
	function mintPass() public payable {
		require(startMint, "Mint not active");
		require(tokenIds < maxTokenIds, "All passes minted");
		// One pass per wallet - not sure if we want this so removed for now
		//require(IERC721(address(this)).balanceOf(msg.sender) == 0, "Only one mint allowed per wallet");
		require(msg.value >= NFT_price, "Not enough eth sent");
		tokenIds += 1;
		_safeMint(msg.sender, tokenIds);
	}

	/**
	* @dev withdraw eth to owner
	* 	   possible that we will not use this and send to multi sig wallet instead
	*/
	function withdraw() public onlyOwner {
		address _owner = owner();
		uint256 amount = address(this).balance;
		(bool sent, ) =  _owner.call{value: amount}("");
		require(sent, "Failed to send Ether");
	}

	// Function to receive Ether. msg.data must be empty
	receive() external payable {}

	// Fallback function is called when msg.data is not empty
	fallback() external payable {}
}