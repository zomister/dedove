import { useEffect, useState } from 'react';

type HealthResponse = { status: string };

export default function App() {
    const [status, setStatus] = useState<string>('... L O A D I N G ...')

    useEffect(() => {
        fetch('/api/v1/health')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json() as Promise<HealthResponse>
            })
            .then((data) => setStatus(data.status.toUpperCase()))
            .catch(() => setStatus('ERROR'))
    }, [])

    const teamName = '(Ď)Edové'
    const teamMembers: string[] = ['Jakub Skramuský', 'Kristián Pěnička', 'Miroslav Štecha']

    return (
        <>
            <p>Think different Academy</p>
            <p>Status: {status}</p>
            <p>{teamName}</p>
            <p>{teamMembers.join(', ')}</p>
        </>
    )
}