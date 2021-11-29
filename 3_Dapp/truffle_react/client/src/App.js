import React, { useEffect, useState, useRef } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

import "./App.css";

function App() {
  const [state, setState] = useState({ storageValue: 0, web3: null, accounts: null, contract: null });
  const inputRef = useRef();
  const [setEventValue, setSetEventValue] = useState (0)
  
  useEffect(() => {
    (async function () {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SimpleStorageContract.networks[networkId];
        const instance = new web3.eth.Contract(
          SimpleStorageContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        let value = await instance.methods.get().call();
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        setState({ storageValue: value, web3: web3, accounts: accounts, contract: instance });

        await instance.events.SetEvent()
          .on('data', event => {
            let value = event.returnValues.value;
            console.log(value);
            setSetEventValue(value);
          })
          .on('changed', changed => console.log(changed))
          // .on('error', err => throw err)
          .on('connected', str => console.log(str))

      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    })();
  }, [])

  useEffect(()=> {
    setState(s => ({...s, storageValue: setEventValue}))
  }, [setEventValue])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { accounts, contract } = state;
    let value = inputRef.current.value.toUpperCase();
    await contract.methods.set(value).send({ from: accounts[0] });
  }

  const handleChange = (e) => {
    if (e.target.value < 0) {
      e.target.value = e.target.value.slice(0, 0);
    }
  }

  if (!state.web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div className="App">
      <h1>Good to Go!</h1>
      <p>Your Truffle Box is installed and ready.</p>
      <h2>Smart Contract Example</h2>
      <p>
        If your contracts compiled and migrated successfully, below will show
        a stored value of 5 (by default).
      </p>
      <p>
        Try changing the value stored on <strong>line 42</strong> of App.js.
      </p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          <input type="text" ref={inputRef} onChange={handleChange} className="input" />
        </label>
        <input type="submit" value="Set" className="button" />
      </form>
      <div>The stored value is: {state.storageValue}</div>
      <div>The event value is: {state.storageValue}</div>
      <div>The stored value is: {state.eventValue}</div>
    </div>
  );
}
export default App;











// import React, { Component, useEffect, useState, useRef } from "react";
// import SimpleStorageContract from "./contracts/SimpleStorage.json";
// import getWeb3 from "./getWeb3";

// import "./App.css";

// function App() {
//   const [state, setState] = useState({ storageValue: 0, web3: null, accounts: null, contract: null, eventValue:0 });
//   const inputRef = useRef();
//   const [setEventValue, setSetEventValue] = useState(0);

//   useEffect(() => { 
//   (async function () {
//     try {
//       // Get network provider and web3 instance.
//       const web3 = await getWeb3();

//       // Use web3 to get the user's accounts.
//       const accounts = await web3.eth.getAccounts();

//       // Get the contract instance.
//       const networkId = await web3.eth.net.getId();
//       const deployedNetwork = SimpleStorageContract.networks[networkId];
//       const instance = new web3.eth.Contract(
//         SimpleStorageContract.abi,
//         deployedNetwork && deployedNetwork.address,
//       );

//       let value = await instance.methods.get().cal();
//       // Set web3, accounts, and contract to the state, and then proceed with an
//       // example of interacting with the contract's methods.
//       setState({ storageValue: value, web3: web3, accounts: accounts, contract: instance });

//       await instance.events.isSet()
//         .on("data", event => {
//           let value = event.returnValues.value;
//           console.log(value);
//           setSetEventValue(value);
//         })
//         .on("changed", changed => console.log(changed))
//         .on("connected", str => console.log(str))

//     } catch (error) {
//       // Catch any errors for any of the above operations.
//       alert(
//         `Failed to load web3, accounts, or contract. Check console for details.`,
//       );
//       console.error(error);
//     }
//   })();
//   }, [])

//   useEffect(() => {
//     setState({...state, storageValue: setEventValue})
//   }, [setEventValue])

//   const updateStateValue = value => setState({storageValue: value});

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { accounts, contract } = state;
//     let value = inputRef.current.value.toUpperCase();
//     await contract.methods.set(value).send({ from: accounts[0] });
//   }

//   const handleCheange = (e) => {
//     if (e.target.value < 0) {
//       e.target.value = e.target.value.slice(0, 0);
//     }
//   }

//   if (!state.web3) {
//     return <div>Loading Web3, accounts, and contract...</div>;
//   }
//   return (
//     <div className="App">
//       <h1>Good to Go!</h1>
//       <p>Your Truffle Box is installed and ready.</p>
//       <h2>Smart Contract Example</h2>
//       <p>
//         If your contracts compiled and migrated successfully, below will show
//         a stored value of 5 (by default).
//       </p>
//       <p>
//         Try changing the value stored on <strong>line 42</strong> of App.js.
//       </p>
//       <form onSubmit={handleSubmit} className="form">
//         <label>
//           <input type="text" ref={inputRef} onChange={handleCheange} className="input" />
//         </label>
//       </form>
//       <div>The event value is: {state.storageValue}</div>
//       <div>The stored value is: {state.eventValue}</div>
//     </div>
//     );
// }

// export default App;














// import React, { Component } from "react";
// import SimpleStorageContract from "./contracts/SimpleStorage.json";
// import getWeb3 from "./getWeb3";

// import "./App.css";

// class App extends Component {
//   state = { storageValue: 0, web3: null, accounts: null, contract: null, eventValue:0 };

//   componentDidMount = async () => {
//     try {
//       // Get network provider and web3 instance.
//       const web3 = await getWeb3();

//       // Use web3 to get the user's accounts.
//       const accounts = await web3.eth.getAccounts();

//       // Get the contract instance.
//       const networkId = await web3.eth.net.getId();
//       const deployedNetwork = SimpleStorageContract.networks[networkId];
//       const instance = new web3.eth.Contract(
//         SimpleStorageContract.abi,
//         deployedNetwork && deployedNetwork.address,
//       );

//       // Set web3, accounts, and contract to the state, and then proceed with an
//       // example of interacting with the contract's methods.
//       this.setState({ web3, accounts, contract: instance });
//     } catch (error) {
//       // Catch any errors for any of the above operations.
//       alert(
//         `Failed to load web3, accounts, or contract. Check console for details.`,
//       );
//       console.error(error);
//     }
//   };

//   runExample = async () => {
//     const { accounts, contract } = this.state;

//     // Stores a given value, 5 by default.
//     let valueTyped= document.getElementById('inputValue').value;
//     const objet = await contract.methods.set(valueTyped).send({ from: accounts[0] });
//     console.log(objet);
//     let valueEvent = objet.events.isSet.returnValues.value;
//     // Get the value from the contract to prove it worked.
//     const response = await contract.methods.get().call();

//     // Update state with the result.
//     this.setState({ storageValue: response, eventValue: valueEvent });
//   };

//   render() {
//     if (!this.state.web3) {
//       return <div>Loading Web3, accounts, and contract...</div>;
//     }
//     return (
//       <div className="App">
//         <h1>Good to Go!</h1>
//         <p>Your Truffle Box is installed and ready.</p>
//         <h2>Smart Contract Example</h2>
//         <p>
//           If your contracts compiled and migrated successfully, below will show
//           a stored value of 5 (by default).
//         </p>
//         <p>
//           Try changing the value stored on <strong>line 42</strong> of App.js.
//         </p>
//         <div>The stored value is: {this.state.storageValue}</div>
//         <input id="inputValue" type="text" />
//         <button onClick={this.runExample}>AAAAAAEnvoyer valeur</button>
//         <div>The stored value is: {this.state.eventValue}</div>
//       </div>
//     );
//   }
// }

// export default App;


