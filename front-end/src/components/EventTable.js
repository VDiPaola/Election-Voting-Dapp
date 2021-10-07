import Table from 'react-bootstrap/Table';
import moment from 'moment'

export default function EventTable(props) {
    return(
        <Table responsive>
            <thead>
                <tr>
                {props.columns.map((col, index) => (
                    <th key={index}>{col}</th>
                ))}
                </tr>
            </thead>
            <tbody>
                {props.rows.map((row, index) => (
                    <tr key={index}>
                        {row.map((item,index)=>(
                            <td key={index}>{index < 2 ? item : moment(Number(item*1000)).format('LLL')}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}