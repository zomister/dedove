import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Stop = { id: number; name: string; image_url: string };

export default function Stops() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/v1/stops")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Stop[]>;
      })
      .then(setStops)
      .catch(() => setStops([]));
  }, []);

const searchWords = searchTerm.toLowerCase().trim().split(" ");

const filteredStops = stops.filter((stop) => {
  const stopWords = stop.name.toLowerCase().split(" ");
  return searchWords.every((searchWord) => 
    stopWords.some((stopWord) => stopWord.startsWith(searchWord)),
  );
});

  return (
    <>
      <h1 className="font-bold text-lg">Stops:</h1>
      <input
        type="search"
        placeholder="Search stops..."
        className="border p-2 mb-4 w-full"
        value = {searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredStops.length === 0 ? (
        <p>No stops found. :(</p>
      ) : (
      <ul className="">
        {filteredStops.map((stop) => (
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
      )}
    </>
  );
}
