import { Card, Button } from "react-bootstrap";

function BadgerMessage(props) {

    const dt = new Date(props.created);

    const isOwner = props.username
        && props.poster
        && props.username.toLowerCase() === props.poster.toLowerCase();

    return (
        <Card className="mb-3" style={{ width: '100%' }}>
            <Card.Body>
                <Card.Title>{props.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    Posted on {dt.toLocaleDateString()} at {dt.toLocaleTimeString()}
                </Card.Subtitle>
                <Card.Text>
                    <i>{props.poster}</i>
                </Card.Text>
                <Card.Text>{props.content}</Card.Text>
                {isOwner && (
                    <Button
                        variant="danger"
                        onClick={() => props.deleteMessage(props.id)}
                    >
                        Delete
                    </Button>
                )}
            </Card.Body>
        </Card>
    );
}

export default BadgerMessage;