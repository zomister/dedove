import { useEffect, useState } from "react";

type Stop = { id: number; name: string; image_url: string };

export default function Stops() {
  const [stops, setStops] = useState<Stop[]>([]);

  useEffect(() => {
    fetch("/api/v1/stops")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Stop[]>;
      })
      .then(setStops)
      .catch(() => setStops([]));
  }, []);

  if (stops.length === 0) return <p>No stops available.</p>;

  return (
    <>
      <ul>
        <li className="font-bold text-lg">Stops:</li>
        {stops.map((stop) => (
          <li className="" key={stop.id}>
            <div
              className=""
              onClick={() => (window.location.href = `/stops/${stop.id}`)}
            >
              <h2>{stop.name}</h2>
              <img
                className="w-50 h-auto"
                src={stop.image_url}
                alt={stop.name}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
