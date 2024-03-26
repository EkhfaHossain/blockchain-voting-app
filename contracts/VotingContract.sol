//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Create {
    using Counters for Counters.Counter; 

    Counters.Counter public _voterId; 
    Counters.Counter public _candidateId; 

    address public votingOrganizer; 
    bool public votingStarted;
    bool public votingEnded; 

    //--------------Candidate for Voting---------------------- 

    struct Candidate {
        uint256 candidateId;
        string name;
        string age; 
        string image; 
        uint256 voteCount; 
        address _address;
        string ipfs;
    }

    event CandidateCreate (
        uint256 indexed candidateId,
        string name,
        string age,
        string image,
        uint256 voteCount, 
        address _address,
        string ipfs 
    );

    address[] public candidateAddress; 

    mapping(address => Candidate) public candidates;

    //----------End of Candidate Data------------ 

    //------------Voter Data------------------

    address[] public votedVoters;
    address[] public votersAddress;
    mapping(address => Voter) public voters;

    struct Voter {
        uint256 voter_voterId;
        string voter_name; 
        string voter_image;
        address voter_address;
        uint256 voter_allowed;
        bool voter_voted;
        uint256 voter_vote;
        string voter_ipfs;
    }

    event VoterCreated (
        uint256 indexed voter_voterId,
        string voter_name,
        string voter_image,
        address voter_address,
        uint256 voter_allowed,
        bool voter_voted,
        uint256 voter_vote,
        string voter_ipfs
    );

    //--------End of Voter Data----------- 
    event VotingStarted();
    event VotingEnded();

    constructor (){
        votingOrganizer = msg.sender;
        votingStarted = false;
        votingEnded = false; 
    }

    function setCandidate(address _address, string memory _age, string memory _name, string memory _image, string memory _ipfs) public {
        require( votingOrganizer == msg.sender, "Only Organizer can autorize candidate");
        require(candidates[_address]._address != _address, "Candidate with this address already exists");

        _candidateId.increment();

        uint256 idNumber = _candidateId.current();

        Candidate storage candidate = candidates[_address];

        candidate.age = _age;
        candidate.name = _name;
        candidate.candidateId = idNumber;
        candidate.image = _image;
        candidate.voteCount = 0; 
        candidate._address = _address;
        candidate.ipfs = _ipfs;

        candidateAddress.push(_address);

        emit CandidateCreate(idNumber, _age, _name, _image, candidate.voteCount, _address, _ipfs);
    }

    function getCandidate() public view returns (address[] memory) {
        return candidateAddress;  
    }

    function getCandidateLength() public view returns (uint256) {
        return candidateAddress.length;
    }

    function getCandidatedata(address _address) public view returns (string memory, string memory, uint256, string memory, uint256, string memory, address) {
        return (
            candidates[_address].age,
            candidates[_address].name,
            candidates[_address].candidateId,
            candidates[_address].image,
            candidates[_address].voteCount,
            candidates[_address].ipfs,
            candidates[_address]._address
        );
    }

    ////-----------Voter Section-----------

    function voterRight(address _address, string memory _name, string memory _image, string memory _ipfs) public {
        require(votingOrganizer == msg.sender, "Only Organizer can create Voter not you"); 

        _voterId.increment();

        uint256 idNumber = _voterId.current();
        Voter storage voter = voters[_address];

        require(voter.voter_allowed == 0, "Voter with this address already exists");

        voter.voter_allowed = 1;
        voter.voter_name = _name;
        voter.voter_image = _image;
        voter.voter_address = _address;
        voter.voter_voterId = idNumber;
        voter.voter_vote = 1000;
        voter.voter_voted = false;
        voter.voter_ipfs = _ipfs;

        votersAddress.push(_address);

        emit VoterCreated(
            idNumber, _name, _image, _address, voter.voter_allowed, voter.voter_voted, voter.voter_vote, _ipfs
        );
    }

    function vote(address _candidateAddress, uint256 _candidateVoteId) external{ 
        Voter storage voter = voters[msg.sender];
        require(votingStarted, "Voting period has not started yet");
        require(!votingEnded, "Voting period has already ended");
        require(!voter.voter_voted, "You have already Voted");
        require(voter.voter_allowed != 0 , 'You have no right to Vote');

        voter.voter_voted = true; 
        voter.voter_vote = _candidateVoteId;

        votedVoters.push(msg.sender);

        candidates[_candidateAddress].voteCount += voter.voter_allowed;
    }

    function getVoterLength() public view returns(uint256) {
        return votersAddress.length;
    }

    function getVoterdata (address _address) public view returns (uint256, string memory, string memory, address, string memory, uint256, bool) {
        return (
            voters[_address].voter_voterId, 
            voters[_address].voter_name, 
            voters[_address].voter_image, 
            voters[_address].voter_address, 
            voters[_address].voter_ipfs, 
            voters[_address].voter_allowed,
            voters[_address].voter_voted
        );
    }

    function getVotedVoterList() public view returns (address[] memory) {
        return votedVoters; 
    }

    function getVoterList() public view returns (address[] memory) {
        return votersAddress;
    }

     function startVotingPeriod() public {
        require(msg.sender == votingOrganizer, "Only the organizer can start the voting period");
        require(!votingStarted || votingEnded, "Voting period has already started");

        votingStarted = true;
        votingEnded = false; 

        emit VotingStarted();
    }

    function endVotingPeriod() public {
        require(msg.sender == votingOrganizer, "Only the organizer can end the voting period");
        require(votingStarted, "Voting period has not started yet");
        require(!votingEnded, "Voting period has already ended");

        votingEnded = true; 
        emit VotingEnded();
    }

    function determineWinner() public view returns (address) {
        require(votingEnded, "Voting period has not ended yet");

        address winnerAddress;
        uint256 maxVotes = 0;

        for (uint256 i = 0; i < candidateAddress.length; i++) {
            address candidate = candidateAddress[i];
            if (candidates[candidate].voteCount > maxVotes) {
                maxVotes = candidates[candidate].voteCount;
                winnerAddress = candidate;
            }
        }

        return winnerAddress;
    }

    function getWinnerInfo() public view returns ( uint256 candidateId, string memory name, string memory age,string memory image, uint256 voteCount, address _address, string memory ipfs) {
        address winnerAddress = determineWinner();
        Candidate memory winner = candidates[winnerAddress];

        return (
            winner.candidateId,
            winner.name,
            winner.age,
            winner.image,
            winner.voteCount,
            winner._address,
            winner.ipfs
        );
    }

    function getVotingStatus() public view returns (string memory) {
        if (votingEnded) {
            return "Voting has ended";
        } else if (votingStarted) {
            return "Voting is ongoing";
        } else {
            return "Voting has not started yet";
        }
    }

}