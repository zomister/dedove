import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  function sortStops(searchTerm: string) {
    const filteredStops = stops.filter((stop) => {
      const searchWords = searchTerm.toLowerCase().trim().split(" ");

      const stopWords = stop.name.toLowerCase().split(" ");

      return searchWords.every((searchWord) =>
        stopWords.some((stopWord) => stopWord.startsWith(searchWord)),
      );
    });
    console.log("searchTerm", searchTerm);
    console.log("filteredStops", filteredStops);

    if (searchTerm === "") {
      setStops(stops);
    } else {
      setStops(filteredStops);
    }
    
  }

  
  if (stops.length === 0) return <p>No stops available.</p>;

  return (
    <>
      <h1 className="font-bold text-lg">Stops:</h1>
      <input
        type="search"
        placeholder="Search stops..."
        className="border p-2 mb-4 w-full"
        onChange={(e) => sortStops(e.target.value)}
      />
      <ul className="">
        {stops.map((stop) => (
          <li className="w-50" key={stop.id}>
            <Link to={`/stops/${stop.id}`} className="">
              <h2>{stop.name}</h2>
              <img
                className="w-50 h-auto"
                src={stop.image_url}
                alt={stop.name}
              />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
