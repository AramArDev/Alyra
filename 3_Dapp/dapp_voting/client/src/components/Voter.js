import React, { useEffect, useState, useRef } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";

const Voter = ({ parentToChild }) => {
  const { account, contract } = parentToChild;

  const inputAddProposal = useRef();
  const inputVote = useRef();

  const [winer, setWiner] = useState(null);
  const [alertAdd, setAlertAdd] = useState("");
  const [alertVote, setAlertVote] = useState("");

  useEffect(() => {
    (async () => {
      await contract.events.WorkflowStatusChange({ fromBlock: 0 })
        .on("data", (event) => {
          let newStatus = event.returnValues.newStatus;
          if (newStatus >= 5) {
            (async () => {
              await contract.methods.getWinner().call((error, result) => {
                !error && setWiner(result);
              });
            })();
          }
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (connected) => console.log(connected));

      await contract.events.ProposalRegistered({ fromBlock: 0 })
        .on("data", (event) => {
          let proposalId = event.returnValues.proposalId;
          setAlertAdd(proposalId);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (connected) => console.log(connected));

      await contract.events.Voted({ fromBlock: 0 })
        .on("data", (event) => {
          let proposalId = event.returnValues.proposalId;
          setAlertVote(proposalId);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (connected) => console.log(connected));
    })();
  }, []);

  useEffect(() => {
    if (alertAdd !== "") {
      alert(`Le Proposition ${alertAdd} a été ajouté.`);
    }
  }, [alertAdd]);

  useEffect(() => {
    if (alertVote !== "") {
      alert(`Une vote a ete fais pour la proposition ${alertVote}.`);
    }
  }, [alertVote]);

  const addProposal = async (e) => {
    e.preventDefault();
    let value = inputAddProposal.current.value;

    contract.methods.addProposal(value).send({ from: account }, (error) => {
      if (error !== null) {
        console.log(error);
      }
    });
  };

  const vote = async (e) => {
    e.preventDefault();
    let value = inputVote.current.value;

    await contract.methods.setVote(value).send({ from: account }, (error) => {
      if (error !== null) {
        console.log(error);
      }
    });
  };

  return (
    <div>
      <div>
        <h1>Voter</h1>
        <h5>{account}</h5>
        <hr />
        <br></br>
      </div>

      {winer ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Card style={{ width: "50rem" }}>
            <Card.Header>
              <strong>
                {winer
                    ? `La proposition "${winer.description}" a gagné avac ${winer.voteCount} vote(s).`
                    : "Les votes ne sont pas encore finis, le gagnant est inconnu."}
              </strong>
            </Card.Header>
            <Card.Body>
              <h5>{winer ? `Il a eu ${winer.voteCount} vote(s).` : ""}</h5>
            </Card.Body>
          </Card>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Card style={{ width: "50rem" }}>
              <Card.Header>
                <strong>Ajouter une proposition</strong>
              </Card.Header>
              <Card.Body>
                <Form.Group controlId="formAddress">
                  <Form.Control type="text" ref={inputAddProposal} />
                </Form.Group>
                <h6></h6>
                <Button onClick={addProposal} variant="dark">
                  Ajouter
                </Button>
              </Card.Body>
            </Card>
          </div>
          <br></br>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Card style={{ width: "50rem" }}>
              <Card.Header>
                <strong>Voter pour une proposition avec son ID</strong>
              </Card.Header>
              <Card.Body>
                <Form.Group controlId="formAddress">
                  <Form.Control type="text" ref={inputVote} />
                </Form.Group>
                <h6></h6>
                <Button onClick={vote} variant="dark">
                  Voter
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
      <br></br>
    </div>
  );
};

export default Voter;
