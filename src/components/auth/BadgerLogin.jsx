import { useContext } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE, authHeaders } from '../../api';
import BadgerLoginStatusContext from '../contexts/BadgerLoginStatusContext';

export default function BadgerLogin() {
    const [, setLoginStatus] = useContext(BadgerLoginStatusContext);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        const userName = e.target.userName.value;
        const password = e.target.password.value;

        if (!userName || !password) {
            alert("You must provide both a username and pin!");
            return;
        }

        const pinRegex = /^\d{7}$/;
        if (!pinRegex.test(password)) {
            alert("Your pin is a 7-digit number!");
            return;
        }

        fetch(`${API_BASE}/login/`, {
            method: 'POST',
            headers: authHeaders(null, true),
            body: JSON.stringify({
                username: userName,
                pin: password
            })
        })
        .then(async (res) => {
            if (res.status === 200) {
                const data = await res.json();
                alert("Login successful!");
                setLoginStatus({
                    username: data.user.username,
                    token: data.token,
                });
                navigate('/');
            } else if (res.status === 401) {
                alert("Incorrect username or pin!");
            } else {
                alert("An error occurred during login.");
            }
        })
    }

    return (
        <Container>
            <h1>Login</h1>
            <Form onSubmit={handleLogin}>
                <Form.Label htmlFor="userName">Username:</Form.Label>
                <Form.Control
                    type="text"
                    id="userName"
                    name="userName"
                />
                <Form.Label htmlFor="password">Password:</Form.Label>
                <Form.Control
                    type="password"
                    id="password"
                    name="password"
                />
                <Button variant="primary" type="submit">Login</Button>
            </Form>
        </Container>
    );
}