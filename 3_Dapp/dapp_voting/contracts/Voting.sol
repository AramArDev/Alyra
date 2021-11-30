// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";

/** @title The contract to be able to vote.
    @notice For this contract can have three types of users
        - Owner : can add votes and change the contract status
        - Voter : can add proposals and vote for a proposal
        - Public :can only see the winner */
contract Voting is Ownable {

    /// @dev show  proposal id won
    uint winningProposalID;

    /// @dev show list proposals ids wons
    uint[] winningProposalsID;

    /// @dev show list proposals wons
    Proposal[] winningProposals;

    /// @dev list of proposals
    Proposal[] public proposalsArray;
    
    /// @dev the workflow of contract
    WorkflowStatus public workflowStatus;
    
    /// @dev mapper for voters
    mapping (address => Voter) private voters;
    
    /** @dev define the structure of a Voter
        @param isRegistered define if the voter is regitered in
        @param hasVoted define if the voter is has voted
        @param votedProposalId define the voted proposal id */
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /** @dev define the structure of a Proposal
        @param description define description the proposal
        @param voteCount define how many times it has been voted */
    struct Proposal {
        string description;
        uint voteCount;
    }

    /** @dev define different contract states
        @param RegisteringVoters owner  add voters
        @param ProposalsRegistrationStarted voters can add proposals
        @param ProposalsRegistrationEnded owner finished proposals registration 
        @param VotingSessionStarted owner start voting session
        @param VotingSessionEnded owner finished voting session
        @param VotesTallied ownet taille the votes */
    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /** @dev emit when a new voter is registered
        @param voterAddress the address of voter who has just been regitered */
    event VoterRegistered(address voterAddress); 

    /** @dev emit when the states is changed
        @param previousStatus previus status 
        @param newStatus new status */
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    /** @dev emit when a new proposal is registered
        @param proposalId the id of proposal who has just been regitered */
    event ProposalRegistered(uint proposalId);

    /** @dev emit when the voter voted
        @param voter address of the voter
        @param proposalId the proposal id voted */
    event Voted(address voter, uint proposalId);

    /// @dev verify if msg.sender has been registered
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }

    /// @dev verify if msg.sender has been registered or is owner
    modifier onlyOwnerOrVoters() {
        require(voters[msg.sender].isRegistered || owner() == msg.sender, "You're not a owner or voter");
        _;
    }
    
    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //

    /** @dev returns the voter struct of this address
        @param _addr address of  voter
        @return voter struct */
    function getVoter(address _addr) external onlyOwnerOrVoters view returns (Voter memory) {
        return voters[_addr];
    }
    
    /** @dev returns the proposal struct of this id
        @param _id id of proposal
        @return proposal struct */
    function getOneProposal(uint _id) external view returns (Proposal memory) {
        // on puisse pas faire get un proposal qui n'existe pas
        require(_id < proposalsArray.length, 'Proposal not found');
        return proposalsArray[_id];
    }

    /** @dev returns the list of proposals struct who won
        @return list winners proposal struct */
    function getWinners() external view returns (Proposal[] memory) {
        require(workflowStatus == WorkflowStatus.VotesTallied, 'Votes are not tallied yet');
        return winningProposals; // return proposalsArray[winningProposalID];
    }

    /** @dev returns the proposal struct who won
        @return winner proposal struct */
    function getWinner() external view returns (Proposal memory) {
        require(workflowStatus == WorkflowStatus.VotesTallied, 'Votes are not tallied yet');
        return proposalsArray[winningProposalID];
    }
 
    // ::::::::::::: REGISTRATION ::::::::::::: // 

    /** @dev owner register a voter
        @param _addr address of the voter */
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 
    /* facultatif
     * function deleteVoter(address _addr) external onlyOwner {
     *   require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
     *   require(voters[_addr].isRegistered == true, 'Not registered.');
     *   voters[_addr].isRegistered = false;
     *  emit VoterRegistered(_addr);
    }*/

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    /** @dev voter register a proposal
        @param _desc description of the proposal */
    function addProposal(string memory _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer'); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /** @dev voter vote for a proposal
        @param _id id of the proposal */
    function setVote(uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        // si on a _id <= proposalsArray.length execution va cracher si on demande _id = proposalsArray.length
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /* on pourrait factoriser tout ça: par exemple:
    *  function setWorkflowStatus(WorkflowStatus _num) public onlyOwner {
    *    WorkflowStatus pnum = workflowStatus;
    *    workflowStatus = _num;
    *    emit WorkflowStatusChange(pnum, workflowStatus);
        } */ 

    /// @dev owner change status from RegisteringVoters to ProposalsRegistrationStarted
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /// @dev owner change status from ProposalsRegistrationStarted to ProposalsRegistrationEnded
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }
    /// @dev owner change status from ProposalsRegistrationEnded to VotingSessionStarted
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /// @dev owner change status from VotingSessionStarted to VotingSessionEnded
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    // ne pas tester
    /// @dev the owner tailly the votes
    function tallyVotesDraw() external onlyOwner {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
        uint highestCount;
        uint[5] memory winners; // egalite entre 5 proposals max
        uint nbWinners;
        for (uint i = 0; i < proposalsArray.length; i++) {
            if (nbWinners<5){
                if (proposalsArray[i].voteCount == highestCount) {
                    winners[nbWinners]=i;
                    nbWinners++;
                }
                if (proposalsArray[i].voteCount > highestCount) {
                    delete winners;
                    winners[0]= i;
                    highestCount = proposalsArray[i].voteCount;
                    nbWinners=1;
                }
            }
        }
        for(uint j=0;j<nbWinners;j++){
            winningProposalsID.push(winners[j]);
            winningProposals.push(proposalsArray[winners[j]]);
        }
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    /// @dev the owner tailly the votes
    function tallyVotes() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
        uint _winningProposalId;
        for (uint256 p = 0; p < proposalsArray.length; p++) {
            if (proposalsArray[p].voteCount > proposalsArray[_winningProposalId].voteCount) {
                _winningProposalId = p;
            }
        }
        winningProposalID = _winningProposalId;
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}