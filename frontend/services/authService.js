async function requestAuth(path, body) {
    const response = await fetch(`http://localhost:3000${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    let data;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.message || `Request failed with status ${response.status}`);
    }

    return data;
}

export function loginUser({ email, password }) {
    return requestAuth('/auth/login', { email, password });
}

export function registerUser({ email, password, displayName }) {
    return requestAuth('/auth/register', { email, password, displayName });
}