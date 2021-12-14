const AAMasterChef = artifacts.require("AAMasterChef");
const AAYearn = artifacts.require("AAYearn");
const AAS = artifacts.require("AAS");

const fDAI = artifacts.require("fDAI");
const fUSDC = artifacts.require("fUSDC");
const fUSDT = artifacts.require("fUSDT");

module.exports = async function (deployer, _network, accounts) {
  var blockNb = await web3.eth.getBlockNumber();

  /** create token AAS */
  await deployer.deploy(AAS, { from: accounts[0] });
  const aas = await AAS.deployed();

  /** create the contract AAMastechef */
  await deployer.deploy(
    AAMasterChef,
    aas.address,
    accounts[0],
    1,
    blockNb,
    blockNb + 1000
  );
  const masterChef = await AAMasterChef.deployed();

  /** create the contract AAYearn */
  await deployer.deploy(
    AAYearn,
    aas.address,
    10,
  );
  const yearn = await AAYearn.deployed();

  /** add masterChef and yearn in admins for aas token */
  await aas.addAdmin(masterChef.address, { from: accounts[0] });
  await aas.addAdmin(yearn.address, { from: accounts[0] });

  /** create all tokens */
  await deployer.deploy(fDAI);
  await deployer.deploy(fUSDC);
  await deployer.deploy(fUSDT);
  const fdai = await fDAI.deployed();
  const fusdc = await fUSDC.deployed();
  const fusdt = await fUSDT.deployed();

  /** add rewards for each token */
  await masterChef.add(50, fdai.address, true);
  await masterChef.add(30, fusdc.address, true);
  await masterChef.add(20, fusdt.address, true);

  /** get pools infos */
  const poolFDAI = await masterChef.poolInfo(0);
  const poolFUSDC = await masterChef.poolInfo(1);
  const poolFUSDT = await masterChef.poolInfo(2);

  console.log("***** Recompenses of Tokens *****");
  console.log("Recompenses of fDAI : " + poolFDAI.allocPoint);
  console.log("Recompenses of fUSDC : " + poolFUSDC.allocPoint);
  console.log("Recompenses of fUSDT : " + poolFUSDT.allocPoint);

  console.log("\n***** Balance Yearn *****");

  console.log(
    "Balance Yearn before mint : " + (await aas.balanceOf(yearn.address))
  );

  await yearn.mint({ from: accounts[0] });

  console.log(
    "Balance Yearn after mint : " + (await aas.balanceOf(yearn.address))
  );
};
