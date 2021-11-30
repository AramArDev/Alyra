import React, { useEffect, useState} from "react";
import Voting from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";

import 'bootstrap/dist/css/bootstrap.min.css';

import "./App.css";

import Owner from "./components/Owner";
import Voter from "./components/Voter";
import PagePublic from "./components/PagePublic";
import GetVoter from "./components/GetVoter";

function App() {
  const [state, setState] = useState({ account: null, contract: null});

  const [isOwner, setIsOwner] = useState(false);
  const [isVoter, setIsVoter] = useState(false);
  
  useEffect(() => {
    (async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Voting.networks[networkId];
        const instance = new web3.eth.Contract(
          Voting.abi,
          deployedNetwork && deployedNetwork.address,
        );
        
        setState({ account: accounts[0], contract: instance });

        const owner = await instance.methods.owner().call();
        setIsOwner(owner === accounts[0]);

        try {
          await instance.methods.getVoter(accounts[0]).call({ from: accounts[0] })
          .then((result) => {    
            setIsVoter(result.isRegistered);
          })
          .catch(revertReason => console.error({ revertReason }));
        } catch (e) {
          setIsVoter(false);
          console.error(e);
        }

      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      window.ethereum.on("accountsChanged", async function() {
        window.location.reload(false);
      });
    })();
  }, []);

  return (
    <div className="App">

          <div>
            {isOwner && <Owner parentToChild = {state} /> }
            {(!isOwner && isVoter) && <Voter parentToChild = {state} /> }
            {(isOwner || isVoter) && <GetVoter parentToChild = {state} /> }
            {(!isOwner && !isVoter) && <PagePublic parentToChild = {state} /> }
          </div>
  
    </div>
  );
}

export default App;

