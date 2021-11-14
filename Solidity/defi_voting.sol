// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

/**
 * @title C'est une contracte pour faire election.
 */
contract Voting is Ownable{  
    
    // id et address du gagnant
    uint private winningProposalId;
    address private winningProposalAddress;
    
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }
    
    struct Proposal {
        string description;
        uint voteCount;
    }
    
    // tout les voeteus inscrit
    mapping(address => Voter) voters; 
    
    // liste des address et le proposals
    // à l'indice i on a (prpositionsAdrss[i]) l'adress
    // à l'indice i on a (propositions[i]) le structure Proposal qui correspand a l'address
    address[] prpositionsAdrss; 
    Proposal[] propositions;
    
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
    
    WorkflowStatus status = WorkflowStatus.RegisteringVoters;
    
    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    
    ///////////////////////////////////////////////////////////////////////////////////////////
    //                              ENREGISTREMENT ELECTEURS
    ///////////////////////////////////////////////////////////////////////////////////////////
    
    // enregistrement d'electeurs a partir leurs address
    function enregistrementElecteurs(address[] memory _adrss) external onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "Le temp de l'enregisrement est passe");
        
        for(uint i = 0; i < _adrss.length; i++) {
            voters[_adrss[i]].isRegistered = true;
            emit VoterRegistered(_adrss[i]);
        }
    }
    
    // enregistrement d'un electeurs a partir son address
    function enregistrementElecteur(address _address) external onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "Le temp de l'enregisrement est passe");
        
        voters[_address].isRegistered = true;
        emit VoterRegistered(_address);
    }
    
    // change status : RegisteringVoters => ProposalsRegistrationStarted
    function finEnregistrementElecteurs() external onlyOwner {
        require(status == WorkflowStatus.RegisteringVoters, "Ce n'est pas le temps pour fermer la session d'enregistrement d'electeurs");
        
        changeStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////////
    //                                  ENREGISTREMENT PROPOSITIONS
    ///////////////////////////////////////////////////////////////////////////////////////////
    
    // enregister proposition si il n'existe pas deja
    function enregistrementPropositions(address _address, string memory _description) external {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Le temp de l'enregisrement Propositions est passe");
        require(voters[msg.sender].isRegistered, "Tu n'est pas ensrit pour se session de vote. Tu ne peux pas proposer un candidat");
        
        // on a pas deja cette proposition
        for(uint i = 0; i < prpositionsAdrss.length; i++) {
            require(prpositionsAdrss[i] != _address, "Cette proposition existe deja");
        }
        
        // ajout l'address et le proposition, dans les liste conserné
        prpositionsAdrss.push(_address);
        Proposal memory proposal;
        proposal.description = _description;
        propositions.push(proposal);
        emit ProposalRegistered(propositions.length - 1);
    }
    
    // change status : ProposalsRegistrationStarted => ProposalsRegistrationEnded
    function finEnregistrementPropositions() external onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Ce n'est pas le temps pour fermer la session de enregistrement de propositions");
        
        changeStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////////
    //                                      SESSION DE VOTE
    ///////////////////////////////////////////////////////////////////////////////////////////
    
    // change status : ProposalsRegistrationEnded => VotingSessionStarted
    function startVotes() external onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationEnded, "Ce n'est pas le temps pour commencer les votes");
        
        changeStatus(WorkflowStatus.VotingSessionStarted);
    }
    
    // on vote par id de proposition( 1, 2, 3, ... )
    function vote(uint _idProposal) external  {
        require(status == WorkflowStatus.VotingSessionStarted, "Le temp de vote est passe");
        require(_idProposal > 0 && _idProposal <= propositions.length, "N'existe pas tel candidat");
        require(voters[msg.sender].isRegistered, "Tu n'est pas enscrit pour se election");
        require(! voters[msg.sender].hasVoted, "Tu a deja vote");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _idProposal - 1;
        propositions[_idProposal - 1].voteCount++;
        
        emit Voted(msg.sender, _idProposal - 1);
    }
    
    // change status : VotingSessionStarted => VotingSessionEnded
    function finVotes() external onlyOwner {
        require(status == WorkflowStatus.VotingSessionStarted, "Ce n'est pas le temps pour fermer la session de votes");
        
        changeStatus(WorkflowStatus.VotingSessionEnded);
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////////
    //                                      VOTES COMPTABILISE
    ///////////////////////////////////////////////////////////////////////////////////////////
    
    // calcule le gagnant de l'election
    function comptabiliseVotes() external onlyOwner {
        require(status == WorkflowStatus.VotingSessionEnded, "Ce n'est pas le temps pour savoir qui a gagner");
        
        uint max;
        uint maxI;
        
        // par convention si pluseurs candidat ont meme nombre de votes,
        // gagne le candidat qui a ete enregistre le dernier.
        for(uint i = 0; i < propositions.length; i++) {
            if(propositions[i].voteCount >= max) {
                max = propositions[i].voteCount;
                maxI = i;
            }
        }
        
        winningProposalId = maxI + 1;
        winningProposalAddress = prpositionsAdrss[maxI];
        
        changeStatus(WorkflowStatus.VotesTallied);
    }
    
    // envoie l'address et le l'id de gagnant
    function getWinner() public view returns(uint _id, address _address, string memory _description) {
        require(status == WorkflowStatus.VotesTallied, "L'election n'est pas encore termine");
        _address = winningProposalAddress;
        _id = winningProposalId;
        _description = propositions[winningProposalId - 1].description;
    }
    
    // change l'etat 
    function changeStatus(WorkflowStatus _status) private onlyOwner{
        emit WorkflowStatusChange(status, _status);
        status = _status;
    }
}




