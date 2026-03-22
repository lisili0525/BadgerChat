import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, authHeaders } from '../../api';
import BadgerLoginStatusContext from '../contexts/BadgerLoginStatusContext';

export default function BadgerLogout() {
    const [loginStatus, setLoginStatus] = useContext(BadgerLoginStatusContext);
    const navigate = useNavigate();

    useEffect(() => {
        const token = loginStatus?.token;
        if (!token) {
            setLoginStatus(undefined);
            sessionStorage.removeItem('loginStatus');
            navigate('/');
            return;
        }
        fetch(`${API_BASE}/logout/`, {
            method: 'POST',
            headers: authHeaders(token),
        })
            .then((res) => res.json())
            .then(() => {
                setLoginStatus(undefined);
                sessionStorage.removeItem('loginStatus');
                alert("You have been logged out!");
                navigate('/');
            })
            .catch(() => {
                setLoginStatus(undefined);
                sessionStorage.removeItem('loginStatus');
                alert("You have been logged out locally.");
                navigate('/');
            });
    // Logout runs once when this screen mounts; token comes from context at that time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>
        <h1>Logout</h1>
        <p>You have been successfully logged out.</p>
    </>;
}
