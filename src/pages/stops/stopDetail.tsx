import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
type StopDetail = {
  id: number;
  name: string;
  image_url: string;
  is_transfer: boolean;
  x: number;
  y: number;
  wheelchair_accessible: boolean;
  has_shelter: boolean;
  has_bench: boolean;
  has_ticket_machine: boolean;
  has_display: boolean;
};

export default function StopDetail() {
  const { id } = useParams();
  const [stop, setStop] = useState<StopDetail | null>(null);
  const [status, setStatus] = useState(true);

  useEffect(() => {
    setStatus(true);
    fetch(`/api/v1/stops/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<StopDetail>;
      })
      .then(setStop)
      .catch(() => setStop(null))
      .finally(() => setStatus(false));
  }, [id]);

  if (status) return <p>... L O A D I N G ...</p>;
  if (!stop) return <p>Stop not found.</p>;

  return (
    <>
      <h1>Stop Detail:</h1>
      <ul>
        <li>ID: {id}</li>
        <li>Name: {stop.name}</li>
        <li>Is Transfer: {stop.is_transfer ? "Yes" : "No"}</li>
        <li>X, Y: {stop.x}, {stop.y}</li>
        <li>Wheelchair Accessible: {stop.wheelchair_accessible ? "Yes" : "No"}</li>
        <li>Has Shelter: {stop.has_shelter ? "Yes" : "No"}</li>
        <li>Has Bench: {stop.has_bench ? "Yes" : "No"}</li>
        <li>Has Ticket Machine: {stop.has_ticket_machine ? "Yes" : "No"}</li>
        <li>Has Display: {stop.has_display ? "Yes" : "No"}</li>
      </ul>
      <img className="w-50 h-auto" src={stop.image_url} alt={stop.name} />
    </>
  );
}
