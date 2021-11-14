Le dossier voting contient l'application pour defi 2.

Pour pouvoir tester il faut :
    - Récupérer les smart contracts d’openZeppelin (Pour Migrate)
        $ npm install @openzeppelin/contracts --save

    - Récupérer les openZeppelin helpers (Pour Test)
        $ npm install @openzeppelin/test-helpers --save

    - Deployer 
        truffle migrate --reste
        truffle test


**J'ai fais deux petit changement sur le fichier Voting.sol pour que le contract ne crache pas :**
    **- getOneProposal** : j'ai ajouter une require pour que on puisse pas demander un proposal qui n'existe pas.
    require(_id < proposalsArray.length, 'Proposal not found');

    **- setVote** : changement <= par <
    avec le require 
    require(_id <= proposalsArray.length, 'Proposal not found');
    on peut faire setVote(proposalsArray.length) et comme ca le contract va craché.
    Donc je l'ai changé par :
    require(_id < proposalsArray.length, 'Proposal not found');
