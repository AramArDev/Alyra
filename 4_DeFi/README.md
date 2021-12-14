# DeFi

## Installer/executer le projet
- lancer ganache-cli ou ganache (changer truffle-config.js et le port dans 2_deploy_uniswap.js)
- sous le dossier parent
  - npm install
  - truffle migrate --reset --network NomReseau 


<br/>
<br/>

## 1. Fork UniswapV2.
- fork UniswapV2 core et periphery et renomage des contracts.
- mise à jour en Solidity 0.8.10 et retrait de SafeMath.
- fixe des fonctions pairFor et getReserves.
- script de deploiement (2_deploy_uniswap.js) 

## 2. Fork Masterchef Sushiswap.
- fork MasterChef et renomage de contract.
- mise à jour en Solidity 0.8.10 et retrait de SafeMath.
- creation de ERC20 token AAS.
- script de deploiement (3_deploy_sushiswap_and_staking.js).


## 3. Stacking, creation contract Yearn.
- creation de ERC20 token AAYearn qui stack les AAS en stkAAS.
- script de deploiement (3_deploy_sushiswap_and_staking.js).
- REMARQUE : 1 hours a été changé en 1 seconds pour pouvoir faire les tests.

