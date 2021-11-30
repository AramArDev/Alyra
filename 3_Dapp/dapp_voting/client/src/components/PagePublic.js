import React, { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import Card from "react-bootstrap/Card";

const PagePublic = ({ parentToChild }) => {
  const { account, contract } = parentToChild;

  const [winer, setWiner] = useState(null);

  useEffect(() => {
    (async () => {
      if (contract) {
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
      }
    })();
  }, [contract]);

  return (
    <div>
      <h1>Public</h1>
      <h5>{account}</h5>
      <hr />
      <br></br>

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
    </div>
  );
};

export default PagePublic;
