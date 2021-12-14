const { BN, constants } = require("@openzeppelin/test-helpers");
const Web3 = require("web3");
const AASwapPair = artifacts.require("AASwapPair");
const AASwapFactory = artifacts.require("AASwapFactory");
const AASwapRouter = artifacts.require("AASwapRouter");
const fDAI = artifacts.require("fDAI");
const fUSDC = artifacts.require("fUSDC");
const fUSDT = artifacts.require("fUSDT");
const WETH9 = artifacts.require("AAWETH9");

module.exports = async function (deployer, _network, accounts) {
  
  // Initialize web3.
  const currentProvider = new Web3.providers.HttpProvider(
    "http://127.0.0.1:8545" // ganach-cli
    // "http://127.0.0.1:7545" // ganach
  );
  const web3 = new Web3(currentProvider);
  console.log("=> web3 intialized.");

  // Deploy Tokens.
  await deployer.deploy(WETH9);
  await deployer.deploy(fDAI);
  await deployer.deploy(fUSDC);
  await deployer.deploy(fUSDT);
  const weth9 = await WETH9.deployed();
  const fdai = await fDAI.deployed();
  const fusdc = await fUSDC.deployed();
  const fusdt = await fUSDT.deployed();
  console.log("=> Tokens deployed.");

  // Deploy AASwapFactory and AASwapRouter.
  await deployer.deploy(AASwapFactory, accounts[0]);
  const swapFactory = await AASwapFactory.deployed();
  await deployer.deploy(AASwapRouter, swapFactory.address, weth9.address);
  const swapRouter = await AASwapRouter.deployed();
  console.log("=> swapFactory and swapRouter deployed.");

  // Create Pairs.
  await swapFactory.createPair(fdai.address, weth9.address);
  await swapFactory.createPair(fusdc.address, weth9.address);
  await swapFactory.createPair(fusdt.address, weth9.address);
  console.log("=> Pairs created.");

  // Get Pairs Contracts.
  const swapPairFdaiWeth9Address = await swapFactory.getPair(
    fdai.address,
    weth9.address
  );
  const swapPairFusdcWeth9Address = await swapFactory.getPair(
    fusdc.address,
    weth9.address
  );
  const swapPairFusdtWeth9Address = await swapFactory.getPair(
    fusdt.address,
    weth9.address
  );
  const swapPairFdaiWeth9Contract = new web3.eth.Contract(
    AASwapPair.abi,
    swapPairFdaiWeth9Address
  );
  const swapPairFusdcWeth9Contract = new web3.eth.Contract(
    AASwapPair.abi,
    swapPairFusdcWeth9Address
  );
  const swapPairFusdtWeth9Contract = new web3.eth.Contract(
    AASwapPair.abi,
    swapPairFusdtWeth9Address
  );
  console.log("=> Contracts get.");

  // Mint Tokens.
  await fdai.mint(accounts[0], web3.utils.toWei("1000000"));
  await fusdc.mint(accounts[0], web3.utils.toWei("1000000"));
  await fusdt.mint(accounts[0], web3.utils.toWei("1000000"));
  console.log("=> Tokens minted.");

  // Approve Tokens.
  await weth9.approve(swapRouter.address, web3.utils.toWei("10000000"));
  await fdai.approve(swapRouter.address, web3.utils.toWei("10000000"));
  await fusdc.approve(swapRouter.address, web3.utils.toWei("10000000"));
  await fusdt.approve(swapRouter.address, web3.utils.toWei("10000000"));
  console.log("=> Tokens approved.");

  // Add Tokens liquidity.
  await swapRouter.addLiquidityETH(
    fdai.address,
    web3.utils.toWei("10000"),
    0,
    0,
    accounts[0],
    constants.MAX_UINT256,
    { value: web3.utils.toWei("1") }
  );
  await swapRouter.addLiquidityETH(
    fusdc.address,
    web3.utils.toWei("10000"),
    0,
    0,
    accounts[0],
    constants.MAX_UINT256,
    { value: web3.utils.toWei("1") }
  );
  await swapRouter.addLiquidityETH(
    fusdt.address,
    web3.utils.toWei("10000"),
    0,
    0,
    accounts[0],
    constants.MAX_UINT256,
    { value: web3.utils.toWei("1") }
  );
  console.log("=> Tokens liquidity added.");

  // Check Balance.
  console.log("***** Check Balances and reserves *****");
  let fdaiBalanceAccount0 = await fdai.balanceOf(accounts[0]);
  let fusdcBalanceAccount0 = await fusdc.balanceOf(accounts[0]);
  let fusdtBalanceAccount0 = await fusdt.balanceOf(accounts[0]);
  console.log(
    "FDAI Balance (Account0): " + web3.utils.fromWei(fdaiBalanceAccount0)
  );
  console.log(
    "FUSDC Balance (Account0): " + web3.utils.fromWei(fusdcBalanceAccount0)
  );
  console.log(
    "FUSDT Balance (Account0): " + web3.utils.fromWei(fusdtBalanceAccount0)
  );

  let swapPairFdaiWeth9Reserves = await swapPairFdaiWeth9Contract.methods
    .getReserves()
    .call();
  let swapPairFdaiWeth9Reserve0 = swapPairFdaiWeth9Reserves._reserve0;
  let swapPairFdaiWeth9Reserve1 = swapPairFdaiWeth9Reserves._reserve1;
  console.log(
    "FDAI/WETH Reserve 0: " + web3.utils.fromWei(swapPairFdaiWeth9Reserve0)
  );
  console.log(
    "FDAI/WETH Reserve 1: " + web3.utils.fromWei(swapPairFdaiWeth9Reserve1)
  );

  let swapPairFusdcWeth9Reserves = await swapPairFusdcWeth9Contract.methods
    .getReserves()
    .call();

  let swapPairFusdcWeth9Reserve0 = swapPairFusdcWeth9Reserves._reserve0;
  let swapPairFusdcWeth9Reserve1 = swapPairFusdcWeth9Reserves._reserve1;
  console.log(
    "FUSDC/WETH Reserve 0: " + web3.utils.fromWei(swapPairFusdcWeth9Reserve0)
  );
  console.log(
    "FUSDC/WETH Reserve 1: " + web3.utils.fromWei(swapPairFusdcWeth9Reserve1)
  );

  let swapPairFusdtWeth9Reserves = await swapPairFusdtWeth9Contract.methods
    .getReserves()
    .call();
  let swapPairFusdtWeth9Reserve0 = swapPairFusdtWeth9Reserves._reserve0;
  let swapPairFusdtWeth9Reserve1 = swapPairFusdtWeth9Reserves._reserve1;
  console.log(
    "FUSDT/WETH Reserve 0: " + web3.utils.fromWei(swapPairFusdtWeth9Reserve0)
  );
  console.log(
    "FUSDT/WETH Reserve 1: " + web3.utils.fromWei(swapPairFusdtWeth9Reserve1)
  );

  // Swap ETH to FDAI.
  console.log("***** Swap ETH to FDAI *****");

    await swapRouter.swapExactETHForTokens(
      new BN(web3.utils.toWei("0.1", "ether")),
      [weth9.address, fdai.address],
      accounts[0],
      new BN(constants.MAX_UINT256),
      { value: new BN(web3.utils.toWei("0.1", "ether")), gas: "3000000" }
    );

    console.log("=> ETH to FDAI swapped.");

    swapPairFdaiWeth9Reserves = await swapPairFdaiWeth9Contract.methods
      .getReserves()
      .call();
    swapPairFdaiWeth9Reserve0 = swapPairFdaiWeth9Reserves._reserve0;
    swapPairFdaiWeth9Reserve1 = swapPairFdaiWeth9Reserves._reserve1;
    console.log(
      "FDAI/WETH Reserve 0: " + web3.utils.fromWei(swapPairFdaiWeth9Reserve0)
    );
    console.log(
      "FDAI/WETH Reserve 1: " + web3.utils.fromWei(swapPairFdaiWeth9Reserve1)
    );

};
