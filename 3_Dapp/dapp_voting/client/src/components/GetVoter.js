import React, { useEffect, useState, useRef } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";

const GetVoter = ({ parentToChild }) => {
  const { account, contract } = parentToChild;

  const inputGetVoter = useRef();
  const [voterSearched, setVoterSearched] = useState("");
  const [voter, setVoter] = useState({
	isRegistered: "",
	hasVoted: "",
	votedProposalId: "",
  });

  useEffect(() => {
	(async () => {
	  if (voterSearched !== "") {
		try {
		  await contract.methods.getVoter(voterSearched)
			.call({ from: account })
			.then((result) => {
			  setVoter({
				isRegistered: result.isRegistered,
				hasVoted: result.hasVoted,
				votedProposalId: result.votedProposalId,
			  });
			});
		} catch (e) {
		  setVoter("Erreur");
		  console.error(e);
		}
	  }
	})();
  }, [voterSearched]);

  const getVoter = async (e) => {
	e.preventDefault();
	let value = inputGetVoter.current.value;
	setVoterSearched(value);
  };

  return (
	<div>
	  <div style={{ display: "flex", justifyContent: "center" }}>
		<Card style={{ width: "50rem" }}>
		  <Card.Header>
			<strong>Trouver un voteur</strong>
		  </Card.Header>
		  <Card.Body>
			<Form.Group controlId="formAddress">
			  <Form.Control type="text" ref={inputGetVoter} />
			</Form.Group>
			<h6></h6>
			<Button onClick={getVoter} variant="dark">
			  Trouver
			</Button>
			<br></br>
			<br></br>
			{voterSearched !== "" && (
			  <div>
				{voter.isRegistered 
				  ? (voter.hasVoted 
						? <h5>Il/elle a voté pour la proposition {voter.votedProposalId}.</h5>
						: <h5>Il/elle est enregister mais n'a pas voté</h5>) 
				  :<h5>Il n'est pas un voteur</h5>
				}
			  </div>
			)}
		  </Card.Body>
		</Card>
	  </div>
	  <br></br>
	</div>
  );
};

export default GetVoter;
