import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

export default function CreateElection(props){
    return(
        <div as={Form}>
            <h3 className="mx-auto">Create Election</h3>
            <Form.Group className="mb-3">
                <Form.Label>Registration Period (mins)</Form.Label>
                <input type="text" className="form-control" placeholder="5" id="formRegistrationPeriod"/>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Voting Period (mins)</Form.Label>
                <input type="text" className="form-control" placeholder="5" id="formVotingPeriod" />
            </Form.Group>

            {
            (!props.waitingForEvent && 
            <Button variant="success" onClick={()=>{
                const regVal = document.getElementById("formRegistrationPeriod").value
                const votVal = document.getElementById("formVotingPeriod").value
                document.getElementById("formRegistrationPeriod").value = ""
                document.getElementById("formVotingPeriod").value = ""
                props.onClick(regVal,votVal)
            }}>Create</Button>)
            || (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Creating Election...</span>
            </Spinner>
            )}
        </div>
    )
}