import React from 'react';
import { ethers } from "ethers";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Config from './config.json';

import EventTable from './components/EventTable.js'
import CreateElection from './components/CreateElection.js'
import GetElection from './components/GetElection';

import {Button, Container, Stack} from 'react-bootstrap';

class App extends React.Component {
  constructor(props){
    super(props)
    const {provider, signer} = this.initWeb3()
    this.state = {
      provider:provider,
      signer:signer,
      contract: null,
      userAccount:null,
      tableData:{
        columns:["Id", "Created By", "Registration End", "Voting End"],
        rows:[]
      },
      waitingForEvent:false,
      candidates:[],
      votes:[]
    }

  }

  componentDidMount(){
    this.getUserAccount()
    this.getContract()
    .then(()=>this.getElectionEvents())
    .catch(err=>console.log(err))
  }

  metamaskLogin(){
    //prompt user to login to metamask
    if(window.ethereum){
      window.ethereum.request({method:"eth_requestAccounts"})
      .then((accounts)=>{
        if(accounts.length > 0){
          this.setState({userAccount: accounts[0]})
        }
      })
      .catch(err=>console.log(err))
    }
  }

  initWeb3(){
    //get provider and signer using either rpc network or injected depending on config
    let provider = null;
    if (Config.isWeb3){
      if(window.ethereum){
        provider = new ethers.providers.Web3Provider(window.ethereum)
        provider.on("network", (_, oldNetwork) => {
          if (oldNetwork) {
              window.location.reload();
          }
      });
      }
    }else{
      provider = new ethers.providers.JsonRpcProvider(Config.provider);
    }
    const signer = provider ? provider.getSigner() : null;
    return {provider, signer}
  }

  async getUserAccount(){
    //get account from signer if they are logged in already
    if(this.state.signer){
      let address = null;
      await this.state.signer.getAddress().then(addr=>address = addr).catch(err=>console.log("user not logged in"))
      this.setState({userAccount:address})
    }
  }

  async getContract(){
    return new Promise((resolve,reject)=>{
      if(this.state.provider){
        const contract = new ethers.Contract(Config.contract.address, Config.contract.abi,this.state.provider)
        this.setState({contract: contract},()=>resolve())
      }else{
        reject("App.getContract provider not set")
      }
    })
  }

  async getElectionEvents(){
    //get all events and listen to new ones
    if(this.state.contract){
      this.state.contract.queryFilter("ElectionCreated")
      .then(async data=>{
        //get all data
        const newData = data.map(item=>item.args)
        await this.storeElectionEvents(newData)
        //listen for new events
        this.state.contract.on("ElectionCreated", (id, createdBy, registrationEnd, votingEnd)=>{
          this.storeElectionEvents([{id, createdBy, registrationEnd, votingEnd}])
        })
      })
      .catch(err=>console.log(err))
    }
  }

  async storeElectionEvents(data){
    return new Promise((resolve,reject)=>{
      if(data.length <= 0){reject()}
      //store data from events
      let tableData = {...this.state.tableData}
      for(let obj of data){
        //make sure its not in the data already
        if(!tableData.rows.some((item)=> String(item[0]) === String(obj.id))){
          tableData.rows.push([String(obj.id),String(obj.createdBy),String(obj.registrationEnd),String(obj.votingEnd)])
        }
      }
      
      this.setState({tableData:tableData, waitingForEvent:false},()=>resolve())
    })
    
  }

  createElectionHandleClick(registrationPeriod, votingPeriod){
    if(!isNaN(registrationPeriod) && !isNaN(votingPeriod) && this.state.contract){
      if(Config.isWeb3){
          this.state.contract.createElection(registrationPeriod, votingPeriod)
      }else{
          const wallet = new ethers.Wallet(Config.test_private_key, this.state.provider)
          const contract = new ethers.Contract(Config.contract.address, Config.contract.abi,wallet)
          contract.createElection(registrationPeriod, votingPeriod)
      }
      this.setState({waitingForEvent:true})
    }
  }

  async handleGetElectionClick(id){
    //clear 
    await this.setState({candidates:[],votes:[]})
    //get election from id
    if(!isNaN(id) && this.state.provider){
      if(Config.isWeb3 && this.state.contract){
          this.state.contract.getElection(id)
          .then(this.getElection.bind(this))
          .catch(err=>console.log(err))
      }else if(!Config.isWeb3){
          const wallet = new ethers.Wallet(Config.test_private_key, this.state.provider)
          const contract = new ethers.Contract(Config.contract.address, Config.contract.abi,wallet)
          contract.getElection(id)
          .then(this.getElection.bind(this))
          .catch(err=>console.log(err))
      }
    }
  }

  getElection(data){
    const candidates = ["Candidate",...data.candidates]
    const votes = ["Votes",...data.votes.map(num => String(num))]
    this.setState({candidates:candidates,votes:votes})
  }

  async handleCandidateClick(id){
    //register as candidate
    if(!isNaN(id) && this.state.provider){
      if(Config.isWeb3 && this.state.contract){
          this.state.contract.registerCandidate(id)
          .catch(err=>console.log(err))
      }else if(!Config.isWeb3){
          const wallet = new ethers.Wallet(Config.test_private_key, this.state.provider)
          const contract = new ethers.Contract(Config.contract.address, Config.contract.abi,wallet)
          contract.registerCandidate(id)
          .catch(err=>console.log(err))
      }
    }
  }

  render(){return (
    <Container className="App">
      <Stack gap={1} className="my-1">
        {
          (!this.state.userAccount && <Button onClick={this.metamaskLogin.bind(this)}>Login</Button>) ||
          <p className="mx-auto">Connected Address: {this.state.userAccount}</p>
        }

        {
          this.state.contract && <>
          <CreateElection waitingForEvent={this.state.waitingForEvent} onClick={this.createElectionHandleClick.bind(this)}/>
          <GetElection 
              candidates={this.state.candidates} 
              votes={this.state.votes} 
              onClick={this.handleGetElectionClick.bind(this)}
              onCandidateClick={this.handleCandidateClick.bind(this)}
            />
          </>
        }

        <h2 className="mx-auto">Election Events</h2>
        <EventTable columns={this.state.tableData.columns} rows={this.state.tableData.rows}/>
      </Stack>
    </Container>
  )}
}

export default App;
