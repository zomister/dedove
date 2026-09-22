import { useEffect, useState } from 'react';

type HealthResponse = { status: string };
type Member = { id: number; name: string };
type Team = { id: number; name: string; members: Member[] };

export default function App() {
    const [status, setStatus] = useState<string>('... L O A D I N G ...')
    const [teams, setTeams] = useState<Team[]>([])

    useEffect(() => {
        fetch('/api/v1/health')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json() as Promise<HealthResponse>
            })
            .then((data) => setStatus(data.status.toUpperCase()))
            .catch(() => setStatus('ERROR'))
    }, [])

    useEffect(() => {
        fetch('/api/v1/teams')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json() as Promise<Team[]>
            })
            .then(setTeams)
            .catch(() => setTeams([]))
    }, [])

    return (
        <>
            <p>Think different Academy</p>
            <p>Status: {status}</p>
            {teams.map((team) => (
                <section key={team.id}>
                    <p>{team.name}</p>
                    <p>{team.members.map((m) => m.name).join(', ')}</p>
                </section>
            ))}
        </>
    )
}