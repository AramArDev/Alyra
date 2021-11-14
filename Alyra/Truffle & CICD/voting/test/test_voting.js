const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

const VotingContract = artifacts.require("Voting");

contract("Voting", function (accounts) {
    const OWNER = accounts[0];
    const ADDRESS_1 = accounts[1];
    const ADDRESS_2 = accounts[2];
    const ADDRESS_3 = accounts[3];
    const ADDRESS_4 = accounts[4];
    const ADDRESS_NON_REGISTERED = accounts[5];

    const REGISTERING_VOTERS = new BN(0);
    const PROPOSALS_REGISTRATION_STARTED = new BN(1);
    const PROPOSALS_REGISTRATION_ENDED = new BN(2);
    const VOTING_SESSION_STARTED = new BN(3);
    const VOTING_SESSION_ENDED = new BN(4);
    const VOTES_TAILLED = new BN(5);

    const BN_0 = new BN(0);
    const BN_1 = new BN(1);
    const BN_2 = new BN(2);
    const BN_3 = new BN(3);

    let Voting;
    
    context("RegisteringVoters : tester l'enregistrement de voteurs", function() {

        beforeEach(async function () {
            Voting = await VotingContract.new({from: OWNER});
        });

        it("... tester la function getVoter", async () => {
            await Voting.addVoter(ADDRESS_1, {from: OWNER});
            const voter1 = await Voting.getVoter.call(ADDRESS_1, {from: ADDRESS_1});
            const voterNotExists = await Voting.getVoter.call(ADDRESS_2, {from: ADDRESS_1});
            
            expect(voterNotExists.isRegistered).to.equal(false, "Ne doit pas exister tel voteur");
            expect(voter1.isRegistered).to.equal(true, "Doit exister tel voteur");
        });

        it("... tester les requirs de la function addVoter", async () => {
            await expectRevert(Voting.addVoter(ADDRESS_1, {from: ADDRESS_2}), "Ownable: caller is not the owner.");

            await Voting.addVoter(ADDRESS_1, {from: OWNER});
            await expectRevert(Voting.addVoter(ADDRESS_1, {from: OWNER}), "Already registered");
            
            await Voting.startProposalsRegistering({from: OWNER});
            await expectRevert(Voting.addVoter(ADDRESS_1, {from: OWNER}), "Voters registration is not open yet");
        });

        it("... tester la function addVoter", async () => {
            const transaction = await Voting.addVoter(ADDRESS_1, {from: OWNER});
            const voter1 = await Voting.getVoter.call(ADDRESS_1, {from: ADDRESS_1});

            expect(voter1.isRegistered).to.equal(true, "Doit exister tel voteur");
            expectEvent(transaction, "VoterRegistered", {voterAddress: ADDRESS_1});
        });

        it("... tester la function startProposalsRegistering", async () => {
            await expectRevert(Voting.startProposalsRegistering({from: ADDRESS_1}), "Ownable: caller is not the owner.");

            const transaction = await Voting.startProposalsRegistering({from: OWNER});

            await expectRevert(Voting.startProposalsRegistering({from: OWNER}), "Registering proposals cant be started now");
            expectEvent(transaction, "WorkflowStatusChange", {previousStatus: REGISTERING_VOTERS, newStatus: PROPOSALS_REGISTRATION_STARTED});
        });

    });

    context("ProposalsRegistrationStarted : tester l'enregistrement de propositions", function() {
        const description = "description";

        beforeEach(async function () {
            Voting = await VotingContract.new({from: OWNER});

            await Voting.addVoter(ADDRESS_1, {from: OWNER});
            await Voting.addVoter(ADDRESS_2, {from: OWNER});
            await Voting.addVoter(ADDRESS_3, {from: OWNER});
            await Voting.addVoter(ADDRESS_4, {from: OWNER});

            await Voting.startProposalsRegistering({from: OWNER});
        });

        it("... tester la function getOneProposal", async () => {
            await Voting.addProposal(description+1, {from: ADDRESS_1});
            await Voting.addProposal(description+2, {from: ADDRESS_2});

            const proposal1 = await Voting.getOneProposal.call(BN_0, {from: ADDRESS_2});
            const proposal2 = await Voting.getOneProposal.call(BN_1, {from: ADDRESS_4});

            await expectRevert(Voting.getOneProposal(BN_2, {from: ADDRESS_4}), "Proposal not found");
            expect(proposal1.description).to.equal(description+1, "Doit etre description1");
            expect(proposal1.voteCount).to.be.bignumber.equal(BN_0, "Doit etre egual à 0");
            expect(proposal2.description).to.equal(description+2, "Doit etre description2");
            expect(proposal2.voteCount).to.be.bignumber.equal(BN_0, "Doit etre egual à 0");
        });

        it("... tester les requirs de la function addProposal", async () => {
            await expectRevert(Voting.addProposal(description, {from: ADDRESS_NON_REGISTERED}), "You're not a voter");

            await expectRevert(Voting.addProposal("", {from: ADDRESS_1}), "Vous ne pouvez pas ne rien proposer");

            await Voting.endProposalsRegistering({from: OWNER});
            await expectRevert(Voting.addProposal(description, {from: ADDRESS_1}), "Proposals are not allowed yet");
        });

        it("... tester la function addProposal", async () => {
            const transaction = await Voting.addProposal(description, {from: ADDRESS_1});
            const proposal = await Voting.getOneProposal.call(BN_0, {from: ADDRESS_2});

            expect(proposal.description).to.equal(description, "Doit etre le mot \"description\"");
            expect(proposal.voteCount).to.be.bignumber.equal(BN_0, "Doit etre egual à 0");
            expectEvent(transaction, "ProposalRegistered", {proposalId: BN_0});
        });

        it("... tester la function endProposalsRegistering", async () => {
            await expectRevert(Voting.endProposalsRegistering({from: ADDRESS_1}), "Ownable: caller is not the owner.");

            const transaction = await Voting.endProposalsRegistering({from: OWNER});
            expectEvent(transaction, "WorkflowStatusChange", {previousStatus: PROPOSALS_REGISTRATION_STARTED, newStatus: PROPOSALS_REGISTRATION_ENDED}); 

            await Voting.startVotingSession({from: OWNER});
            await expectRevert(Voting.endProposalsRegistering({from: OWNER}), "Registering proposals havent started yet");
        });

        it("... tester la function startVotingSession", async () => {
            await expectRevert(Voting.startVotingSession({from: ADDRESS_1}), "Ownable: caller is not the owner.");
            await expectRevert(Voting.startVotingSession({from: OWNER}), "Registering proposals phase is not finished");

            await Voting.endProposalsRegistering({from: OWNER});
            const transaction = await Voting.startVotingSession({from: OWNER});
            
            expectEvent(transaction, "WorkflowStatusChange", {previousStatus: PROPOSALS_REGISTRATION_ENDED, newStatus: VOTING_SESSION_STARTED});
        });
    });

    context("VotingSessionStarted : tester l'enregistrement de votes", function() {

        beforeEach(async function () {
            const description = "description";

            Voting = await VotingContract.new({from: OWNER});

            await Voting.addVoter(ADDRESS_1, {from: OWNER});
            await Voting.addVoter(ADDRESS_2, {from: OWNER});
            await Voting.addVoter(ADDRESS_3, {from: OWNER});
            await Voting.addVoter(ADDRESS_4, {from: OWNER});

            await Voting.startProposalsRegistering({from: OWNER});

            await Voting.addProposal(description+1, {from: ADDRESS_1});
            await Voting.addProposal(description+2, {from: ADDRESS_2});
            await Voting.addProposal(description+3, {from: ADDRESS_3});

            await Voting.endProposalsRegistering({from: OWNER});
            await Voting.startVotingSession({from: OWNER});
        });

        it("... tester les requirs de la function setVote", async () => {
            await expectRevert(Voting.setVote(BN_0, {from: ADDRESS_NON_REGISTERED}), "You're not a voter");

            await Voting.setVote(BN_2, {from: ADDRESS_2});
            await expectRevert(Voting.setVote(BN_1, {from: ADDRESS_2}), "You have already voted");

            await expectRevert(Voting.setVote(BN_3, {from: ADDRESS_1}), "Proposal not found");

            await Voting.endVotingSession({from: OWNER});
            await expectRevert(Voting.setVote(BN_0, {from: ADDRESS_3}), "Voting session havent started yet");
        });

        it("... tester la function setVote", async () => {
            const transaction1 = await Voting.setVote(BN_2, {from: ADDRESS_1});
            const transaction2 = await Voting.setVote(BN_1, {from: ADDRESS_2});
            const transaction3 = await Voting.setVote(BN_0, {from: ADDRESS_3});
            const transaction4 = await Voting.setVote(BN_1, {from: ADDRESS_4});

            const proposal0 = await Voting.getOneProposal(BN_0);
            const proposal1 = await Voting.getOneProposal(BN_1);
            const proposal2 = await Voting.getOneProposal(BN_2);

            const voter1 = await Voting.getVoter.call(ADDRESS_1, {from: ADDRESS_3});
            const voter2 = await Voting.getVoter.call(ADDRESS_2, {from: ADDRESS_4});
            const voter3 = await Voting.getVoter.call(ADDRESS_3, {from: ADDRESS_2});
            const voter4 = await Voting.getVoter.call(ADDRESS_4, {from: ADDRESS_1});

            expect(voter1.votedProposalId).to.be.bignumber.equal(BN_2, "Doit etre egual a 2");
            expect(voter2.votedProposalId).to.be.bignumber.equal(BN_1, "Doit etre egual a 1");
            expect(voter3.votedProposalId).to.be.bignumber.equal(BN_0, "Doit etre egual a 0");
            expect(voter4.votedProposalId).to.be.bignumber.equal(BN_1, "Doit etre egual a 1");
            expect(voter1.hasVoted).to.equal(true, "Doit etre egual a true");
            expect(voter2.hasVoted).to.equal(true, "Doit etre egual a true");
            expect(voter3.hasVoted).to.equal(true, "Doit etre egual a true");
            expect(voter4.hasVoted).to.equal(true, "Doit etre egual a true");

            expect(proposal0.voteCount).to.be.bignumber.equal(BN_1, "Doit etre egual a 1");
            expect(proposal1.voteCount).to.be.bignumber.equal(BN_2, "Doit etre egual a 2");
            expect(proposal2.voteCount).to.be.bignumber.equal(BN_1, "Doit etre egual a 1");

            expectEvent(transaction1, "Voted", {voter: ADDRESS_1, proposalId: BN_2});
            expectEvent(transaction2, "Voted", {voter: ADDRESS_2, proposalId: BN_1});
            expectEvent(transaction3, "Voted", {voter: ADDRESS_3, proposalId: BN_0});
            expectEvent(transaction4, "Voted", {voter: ADDRESS_4, proposalId: BN_1});
        });

        it("... tester la function endVotingSession", async () => {
            await expectRevert(Voting.endVotingSession({from: ADDRESS_1}), "Ownable: caller is not the owner.");

            const transaction = await Voting.endVotingSession({from: OWNER});

            await expectRevert(Voting.endVotingSession({from: OWNER}), "Voting session havent started yet");
            expectEvent(transaction, "WorkflowStatusChange", {previousStatus: VOTING_SESSION_STARTED, newStatus: VOTING_SESSION_ENDED}); 
        });
    });

    context("VotingSessionEnded : tester quel proposition a gagne", function() {
        const description = "description";

        beforeEach(async function () {
            Voting = await VotingContract.new({from: OWNER});

            await Voting.addVoter(ADDRESS_1, {from: OWNER});
            await Voting.addVoter(ADDRESS_2, {from: OWNER});
            await Voting.addVoter(ADDRESS_3, {from: OWNER});
            await Voting.addVoter(ADDRESS_4, {from: OWNER});

            await Voting.startProposalsRegistering({from: OWNER});

            await Voting.addProposal(description+1, {from: ADDRESS_1});
            await Voting.addProposal(description+2, {from: ADDRESS_2});
            await Voting.addProposal(description+3, {from: ADDRESS_3});

            await Voting.endProposalsRegistering({from: OWNER});
            await Voting.startVotingSession({from: OWNER});

            await Voting.setVote(BN_2, {from: ADDRESS_1});
            await Voting.setVote(BN_1, {from: ADDRESS_2});
            await Voting.setVote(BN_0, {from: ADDRESS_3});
            await Voting.setVote(BN_1, {from: ADDRESS_4});
        });

        it("... tester la function getWinner", async () => {
            await expectRevert(Voting.getWinner({from: ADDRESS_3}), "Votes are not tallied yet");
            
            await Voting.endVotingSession({from: OWNER});
            await Voting.tallyVotes({from: OWNER});
            const winer = await Voting.getWinner.call({from: ADDRESS_3});

            expect(winer.description).to.equal(description+2, "Doit etre egual a le mot \"description2\"");
            expect(winer.voteCount).to.be.bignumber.equal(BN_2, "Doit etre egual a 2");
        });

        it("... tester les requirs de la function tallyVotes", async () => {
            await expectRevert(Voting.tallyVotes({from: OWNER}), "Current status is not voting session ended");

            await Voting.endVotingSession({from: OWNER});
            await expectRevert(Voting.tallyVotes({from: ADDRESS_2}), "Ownable: caller is not the owner.");
        });

        it("... tester la function tallyVotes", async () => {
            await Voting.endVotingSession({from: OWNER});

            const transaction = await Voting.tallyVotes({from: OWNER});
            const winer = await Voting.getWinner.call({from: ADDRESS_3});

            expect(winer.description).to.equal(description+2, "Doit etre egual a le mot \"description2\"");
            expect(winer.voteCount).to.be.bignumber.equal(BN_2, "Doit etre egual a 2");
            expectEvent(transaction, "WorkflowStatusChange", {previousStatus: VOTING_SESSION_ENDED, newStatus: VOTES_TAILLED});
        });

    });
})