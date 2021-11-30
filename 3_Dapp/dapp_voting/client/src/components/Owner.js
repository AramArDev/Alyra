import React, { useEffect, useState, useRef } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";

const Owner = ({ parentToChild }) => {
  const { account, contract } = parentToChild;

  const inputAddVoter = useRef();

  const [winner, setWiner] = useState(null);
  const [alertAdd, setAlertAdd] = useState("");
  const [getWinner, setGetWiner] = useState(false);

  useEffect(() => {
    (async () => {
      await contract.events.VoterRegistered({ fromBlock: 0 })
        .on("data", (event) => {
          let addr = event.returnValues.voterAddress;
          setAlertAdd(addr);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.error(err))
        .on("connected", (connected) => console.log(connected));

      await contract.events.WorkflowStatusChange({ fromBlock: 0 })
        .on("data", (event) => {
          let newStatus = event.returnValues.newStatus;
          if (newStatus >= 5) {
            setGetWiner(true)
          }
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (connected) => console.log(connected));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await contract.methods.getWinner().call((error, result) => {
          !error && setWiner(result);
      });
    })();
  }, [getWinner]);

  useEffect(() => {
    if (alertAdd !== "") {
      alert(`Le voteur ${alertAdd} a été ajouté.`);
    }
  }, [alertAdd]);

  /* ************************************************
                      FUNCTIONS
  ****************************************************** */

  const addVoterSubmit = async (e) => {
    e.preventDefault();
    let value = inputAddVoter.current.value;
    await contract.methods.addVoter(value).send({ from: account });
  };

  const endAddVoters = async () => {
    await contract.methods.startProposalsRegistering().send({ from: account });
  };

  const endProposals = async () => {
    await contract.methods.endProposalsRegistering().send({ from: account });
  };

  const startVotes = async () => {
    await contract.methods.startVotingSession().send({ from: account });
  };

  const endVoting = async () => {
    await contract.methods.endVotingSession().send({ from: account });
  };

  const tallyVotes = async () => {
    await contract.methods.tallyVotesDraw().send({ from: account });
  };

  return (
    <div>
      <div>
        <h1>Owner</h1>
        <h5>{account}</h5>
        <hr />
        <br></br>
      </div>

      {winner ? (
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Card style={{ width: "50rem" }}>
              <Card.Header>
                <strong>
                  {winner
                    ? `La proposition "${winner.description}" a gagné avac ${winner.voteCount} vote(s).`
                    : "Les votes ne sont pas encore finis, le gagnant est inconnu."}
                </strong>
              </Card.Header>
              <Card.Body>
                <h5>{winner ? `Il a eu ${winner.voteCount} vote(s).` : ""}</h5>
              </Card.Body>
            </Card>
          </div>
          <br></br>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Card style={{ width: "50rem" }}>
              <Card.Header>
                <strong>Ajouter des voteurs</strong>
              </Card.Header>
              <Card.Body>
                <Form.Group controlId="formAddress">
                  <Form.Control type="text" ref={inputAddVoter} />
                </Form.Group>
                <h6></h6>
                <Button onClick={addVoterSubmit} variant="dark">
                  Ajouter
                </Button>
                <br></br>
                <br></br>
                <br></br>
                <Button margin="10px" onClick={endAddVoters} variant="dark">
                  Cloturer les ajouts
                </Button>
              </Card.Body>
            </Card>
          </div>
          <br></br>

          {/* FIN PROPOSALS AND START VOTES */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Card style={{ width: "50rem" }}>
              <Card.Header>
                <strong>
                  Mettre fin aux propositions et commencer la vote
                </strong>
              </Card.Header>
              <Card.Body>
                <Button onClick={endProposals} variant="dark">
                  Cloturer les propositions
                </Button>
                <h6></h6>
                <Button margin="10px" onClick={startVotes} variant="dark">
                  Commencer les votes
                </Button>
              </Card.Body>
            </Card>
          </div>
          <br></br>

          {/* FIN VOTES ET COMPTABILISE*/}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Card style={{ width: "50rem" }}>
              <Card.Header>
                <strong>Mettre fin aux votes et comptabiliser</strong>
              </Card.Header>
              <Card.Body>
                <Button onClick={endVoting} variant="dark">
                  Cloturer les votes
                </Button>
                <h6></h6>
                <Button onClick={tallyVotes} variant="dark">
                  Comptabiliser
                </Button>
              </Card.Body>
            </Card>
          </div>
          <br></br>
        </div>
      )}
    </div>
  );
};

export default Owner;
