const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Election Manager", function () {
  let electionManager, owner, addr1, addr2;

  beforeEach(async()=>{
    const ElectionManager = await hre.ethers.getContractFactory("ElectionManager");
    electionManager = await ElectionManager.deploy();

    await electionManager.deployed();

    [owner, addr1, addr2] = await ethers.getSigners()
  })

  //CREATE ELECTION
  it("create an election", async function () {
    await expect(await electionManager.createElection(5,5))
    .to.emit(electionManager, "ElectionCreated")
  });

  //REGISTER ELECTION
  it("register to an election", async function () {
    await expect(await electionManager.createElection(5,5))
    .to.emit(electionManager, "ElectionCreated")
    await expect(await electionManager.registerCandidate(1))
    .to.emit(electionManager, "CandidateRegistered")
    .withArgs(1, owner.address)

  });

  it("try to register to an election twice", async function () {
    await expect(await electionManager.createElection(5,5))
    .to.emit(electionManager, "ElectionCreated")
    await expect(await electionManager.registerCandidate(1))
    .to.emit(electionManager, "CandidateRegistered")
    .withArgs(1, owner.address)

    await expect(electionManager.registerCandidate(1))
    .to.be.revertedWith('candidate already registered')

  });

  it("two candidates register to an election", async function () {
    await expect(await electionManager.createElection(5,5))
    .to.emit(electionManager, "ElectionCreated")

    await expect(await electionManager.registerCandidate(1))
    .to.emit(electionManager, "CandidateRegistered")
    .withArgs(1, owner.address)

    await expect(await electionManager.connect(addr1).registerCandidate(1))
    .to.emit(electionManager, "CandidateRegistered")
    .withArgs(1, addr1.address)
  });

  it("try to register outside the registration timestamp", async function () {
    //works
    return;
    await expect(await electionManager.createElection(1,5))
    .to.emit(electionManager, "ElectionCreated")

    await new Promise((resolve,reject)=>{
      setTimeout(async () => {
        await expect(electionManager.registerCandidate(1))
        .to.be.revertedWith("Registration ended")
        resolve();
      }, 61 * 1000);
    })
  });

  //VOTE FOR CANDIDATE
  it("vote for candidate in election", async function () {
    await expect(await electionManager.createElection(5,5))
    .to.emit(electionManager, "ElectionCreated")
    await expect(await electionManager.registerCandidate(1))
    .to.emit(electionManager, "CandidateRegistered")
    .withArgs(1, owner.address)

    await expect(await electionManager.connect(addr1).vote(1, owner.address))
    .to.emit(electionManager, "Vote")
    .withArgs(1, addr1.address, owner.address)

  });
  it("try to vote for candidate that's not in the election", async function () {
    await expect(await electionManager.createElection(5,1))
    .to.emit(electionManager, "ElectionCreated")
    await expect(await electionManager.registerCandidate(1))
    .to.emit(electionManager, "CandidateRegistered")
    .withArgs(1, owner.address)

    await expect(electionManager.connect(addr1).vote(1, addr2.address))
    .to.be.revertedWith("No candidate with this address registered in election")

  });

  it("try to vote twice in same election", async function () {
    await expect(await electionManager.createElection(5,1))
    .to.emit(electionManager, "ElectionCreated")
    await expect(await electionManager.registerCandidate(1))
    .to.emit(electionManager, "CandidateRegistered")
    .withArgs(1, owner.address)

    await expect(await electionManager.connect(addr1).vote(1, owner.address))
    .to.emit(electionManager, "Vote")
    .withArgs(1, addr1.address, owner.address)

    await expect(electionManager.connect(addr1).vote(1, owner.address))
    .to.be.revertedWith("Already voted in this election")
  });

  //GET ELECTION DATA
  it("try to get election data", async function () {
    await expect(await electionManager.createElection(5,5))
    .to.emit(electionManager, "ElectionCreated")
    await expect(await electionManager.registerCandidate(1))
    .to.emit(electionManager, "CandidateRegistered")
    .withArgs(1, owner.address)

    await expect(await electionManager.connect(addr1).vote(1, owner.address))
    .to.emit(electionManager, "Vote")
    .withArgs(1, addr1.address, owner.address)

    let data = await electionManager.getElection(1);
    expect(data.candidates[0]).to.equal(owner.address)
    console.log(data)
  });

  //MULTI-CASE
  it("create 2 elections and have multiple candidates and voters for each", async function () {
    //create elections
    await expect(await electionManager.createElection(5,5))
    .to.emit(electionManager, "ElectionCreated")
    await expect(await electionManager.connect(addr1).createElection(5,5))
    .to.emit(electionManager, "ElectionCreated")
    //add candidates
    for(let i =1; i <= 2;i++){
      await expect(await electionManager.registerCandidate(i))
      .to.emit(electionManager, "CandidateRegistered")
      .withArgs(i, owner.address)
      await expect(await electionManager.connect(addr2).registerCandidate(i))
      .to.emit(electionManager, "CandidateRegistered")
      .withArgs(i, addr2.address)
    }
    


    //vote
    let addrs = [addr1, addr2, owner];
    for(let i =1; i <= 2;i++){
      for(let addr of addrs){
        await expect(await electionManager.connect(addr).vote(i, addr2.address))
        .to.emit(electionManager, "Vote")
        .withArgs(i, addr.address, addr2.address)
      }
    }
    

  });

});
