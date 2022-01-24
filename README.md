LeafDapp : DApp Leaf
With this dapp you buy an LNFT and while walking you receive LEAFs


Functions

constructor
Name	Type	Description
_leaf	address	the ERC20 LEAF token contract address
_nft	address	the ERC721 LNFT token contract address
Returns:

No parameters

balance
No parameters

Returns:

Name	Type	Description
uint256	
balanceDappEth
No parameters

Returns:

Name	Type	Description
uint256	
balanceDappLeaf
No parameters

Returns:

Name	Type	Description
uint256	
balanceNft
No parameters

Returns:

Name	Type	Description
uint256	
balancePlayer
Name	Type	Description
_player	address	address of player
Returns:

Name	Type	Description
uint256	
buyNft
to play you have to buy the first NFT

No parameters

Returns:

No parameters

getCost
get the cost

No parameters

Returns:

Name	Type	Description
uint256	
getLeaf
No parameters

Returns:

Name	Type	Description
address	
getNft
No parameters

Returns:

Name	Type	Description
address	
getPause
get pause/start the dapp

No parameters

Returns:

Name	Type	Description
bool	
getPlayer
No parameters

Returns:

Name	Type	Description
tuple	
getPlayerWithAddress
Name	Type	Description
_player	address	
Returns:

Name	Type	Description
tuple	
getTest
get on/off test mode

No parameters

Returns:

Name	Type	Description
bool	
getWhitelistPlayer
get the player in whitelist

Name	Type	Description
_player	address	
Returns:

Name	Type	Description
bool	
mintLeaf
mint million LEAF for owner

No parameters

Returns:

No parameters

owner
Returns the address of the current owner.

No parameters

Returns:

Name	Type	Description
address	
removeWhitelistPlayer
remove frome whitelist

Name	Type	Description
_player	address	the address of player
Returns:

No parameters

renounceOwnership
Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

No parameters

Returns:

No parameters

setCost
change the cost

Name	Type	Description
_newCost	uint256	
Returns:

No parameters

setPause
set pause/start the dapp

Name	Type	Description
_state	bool	
Returns:

No parameters

setTest
set on/off test mode

Name	Type	Description
_state	bool	
Returns:

No parameters

stepToLeaf
update player data related to the number of steps

Name	Type	Description
_nbStep	uint256	number of steps per day
Returns:

No parameters

stepToLeafWithoutTimestamp
**Add Documentation for the method here**

Name	Type	Description
_nbStep	uint256	
Returns:

No parameters

transferOwnership
Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.

Name	Type	Description
newOwner	address	
Returns:

No parameters

whitelistPlayer
add to whitelist

Name	Type	Description
_player	address	the address of player
Returns:

No parameters

withdraw
withdraw for only owner

Name	Type	Description
_amount	uint256	the desired amount
Returns:

No parameters
