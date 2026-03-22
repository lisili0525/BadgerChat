import { useContext, useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_BASE, authHeaders } from '../../api';
import BadgerLoginStatusContext from '../contexts/BadgerLoginStatusContext';

export default function BadgerRegister() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [, setLoginStatus] = useContext(BadgerLoginStatusContext);
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();

        if (!userName || !password) {
            alert("You must provide both a username and pin!");
            return;
        }

        const pinRegex = /^\d{7}$/;
        if (!pinRegex.test(password) || !pinRegex.test(repeatPassword)) {
            alert("Your pin must be a 7-digit number!");
            return;
        }

        if (password !== repeatPassword) {
            alert("Your pins do not match!");
            return;
        }

        fetch(`${API_BASE}/register/`, {
            method: 'POST',
            headers: authHeaders(null, true),
            body: JSON.stringify({
                username: userName,
                pin: password
            })
        })
        .then(async (res) => {
            if (res.status === 409) {
                alert("That username has already been taken!");
            } else if (res.status === 200 || res.status === 201) {
                const data = await res.json();
                alert("Registration successful!");
                setLoginStatus({
                    username: data.user.username,
                    token: data.token,
                });
                navigate('/');
            } else {
                alert("An error occurred during registration.");
            }
        })
    }

    return(
        <Container>
            <h1>Register</h1>
            <Form onSubmit = {handleRegister}>
            <Form.Label htmlFor="userName">Username:</Form.Label>
                <Form.Control
                    type="text"
                    id = "userName"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                />
            <Form.Label htmlFor="password">Password:</Form.Label>
                <Form.Control
                    type="password"
                    id = "password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            <Form.Label htmlFor="repeatPassword">Repeat Password:</Form.Label>
                <Form.Control
                    type="password"
                    id = "repeatPassword"
                    value={repeatPassword}
                    onChange={e => setRepeatPassword(e.target.value)}
                />
            <Button variant="primary" type="submit">Register</Button>
            </Form>
        </Container>
    );
}
