import { useEffect, useState } from 'react';

type HealthResponse = { status: string };

export default function App() {
    const [status, setStatus] = useState<string>('Stand by.. Loading...')

    useEffect(() => {
        fetch('/api/health')
            .then((res) => {
                if (!res.ok) throw new Error('HTTP ${res.status}')
                return res.json() as Promise<HealthResponse>
            })
            .then((data) => setStatus(data.status.toUpperCase()))
            .catch(() => setStatus('ERROR'))
    }, [])

    return (
        <>
            <p>Think different Academy</p>
            <p>Status: {status}</p>
        </>
    )
}