import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'



export default function GetElection(props){
    return(
        <>
        <Row className="mt-5">
            <Col xs={3}>
            <input type="text" placeholder="Election Id" id="getElectionInputId" className="form-control" />
            </Col>
            <Col xs={1}>
            <Button variant="success" onClick={()=>{
                props.onClick(document.getElementById("getElectionInputId").value)
            }}>Search</Button></Col>
            <Col>
            <Button variant="primary" onClick={()=>{
                props.onCandidateClick(document.getElementById("getElectionInputId").value)
            }}>Register As Candidate</Button></Col>
        </Row>

        {props.candidates.length > 0 &&
            <Votes candidates={props.candidates} votes={props.votes}/>
        }
        </>
    )
}

function Votes(props){
    return(
        <Table responsive>
            <thead>
                <tr className="text-center">
                {props.candidates.map((candidate, index) => (
                    <th key={index}>{candidate}</th>
                ))}
                </tr>
            </thead>
            <tbody>
            <tr className="text-center">
                {props.votes.map((votes, index) => (
                    
                        <td key={index}>{votes}</td>
                    
                ))}
            </tr>
            </tbody>
        </Table>
    )
}