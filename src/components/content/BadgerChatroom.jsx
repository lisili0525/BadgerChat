import { useEffect, useState, useContext, useCallback } from "react";
import { Row, Col, Pagination, Form, Button } from "react-bootstrap";
import { API_BASE, authHeaders } from "../../api";
import BadgerMessage from "./BadgerMessage";
import BadgerLoginStatusContext from "../contexts/BadgerLoginStatusContext";

export default function BadgerChatroom(props) {

    const [messages, setMessages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loginStatus] = useContext(BadgerLoginStatusContext);
    const username = loginStatus ? loginStatus.username : null;

    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');

    const loadMessages = useCallback(() => {
        const q = new URLSearchParams({
            chatroom: props.name,
            page: String(currentPage),
        });
        fetch(`${API_BASE}/messages/?${q.toString()}`)
            .then((res) => res.json())
            .then((json) => {
                setMessages(json.messages || []);
            });
    }, [props.name, currentPage]);

    const deleteMessage = (messageId) => {
        const token = loginStatus?.token;
        if (!token) {
            alert("You must be logged in to delete.");
            return;
        }
        fetch(`${API_BASE}/messages/?id=${messageId}`, {
            method: 'DELETE',
            headers: authHeaders(token),
        })
        .then(res => {
            if (res.ok) {
                alert("Successfully deleted the post!");
                loadMessages();
            } else {
                alert("Failed to delete the post.");
            }
        })
    };


    // Why can't we just say []?
    // The BadgerChatroom doesn't unload/reload when switching
    // chatrooms, only its props change! Try it yourself.
    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (!postTitle || !postContent) {
            alert("You must provide both a title and content!");
            return;
        }
        const token = loginStatus?.token;
        if (!token) {
            alert("You must be logged in to post.");
            return;
        }
        const q = new URLSearchParams({ chatroom: props.name });
        fetch(`${API_BASE}/messages/?${q.toString()}`, {
            method: 'POST',
            headers: authHeaders(token, true),
            body: JSON.stringify({
                title: postTitle,
                content: postContent
            })
        })
        .then(res => {
            if (res.ok) {
                alert("Successfully posted!");
                setPostTitle('');
                setPostContent('');
                loadMessages();
            } else {
                alert("Failed to post your message.");
            }
        })
    }

    return <>
        <h1>{props.name} Chatroom</h1>
        <Row>
            <Col xs={12} md={4}>
                {
                    !loginStatus ? (
                        <h3>You must be logged in to post!</h3>
                    ) : (
                        <Form onSubmit={handlePostSubmit}>
                            <Form.Label htmlFor="Title">Post Title</Form.Label>
                            <Form.Control
                                type="text"
                                id="Title"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                            />
                            <Form.Label htmlFor="Content">Post Content</Form.Label>
                            <Form.Control
                                as="textarea"
                                id="Content"
                                rows={3}
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                            />
                            <Button variant="primary" type="submit">
                                Create Post
                            </Button>
                        </Form>
                    )
                }
            </Col>
            <Col xs={12} md={8}>
                <hr/>
                {
                    messages.length > 0 ?
                        <Row>
                            {
                                messages.map((message) => {
                                    return(
                                        <Col key={message.id} xs={12} sm={6} md={4}>
                                        <BadgerMessage
                                            title={message.title}
                                            poster={message.poster}
                                            content={message.content}
                                            created={message.created}
                                            deleteMessage={deleteMessage}
                                            username={username}
                                            id = {message.id}
                                        />
                                        </Col>
                                    )
                                })
                            }
                        </Row>
                        :
                        <>
                            <p>There are no messages on this page yet!</p>
                        </>
                }
                <Pagination>
                    <Pagination.Item active={currentPage === 1} onClick={() => setCurrentPage(1)}>1</Pagination.Item>
                    <Pagination.Item active={currentPage === 2} onClick={() => setCurrentPage(2)}>2</Pagination.Item>
                    <Pagination.Item active={currentPage === 3} onClick={() => setCurrentPage(3)}>3</Pagination.Item>
                    <Pagination.Item active={currentPage === 4} onClick={() => setCurrentPage(4)}>4</Pagination.Item>
                </Pagination>
            </Col>
        </Row>
    </>
}
