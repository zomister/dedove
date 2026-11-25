import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Scheme, { lines } from "../../components/scheme";
import transfer from "../../assets/icons/vector/extern/transfer.svg";
import noResultsIcon from "../../assets/icons/vector/extern/no-results.svg";
import arrowBack from "../../assets/icons/vector/extern/arrow-back.svg";
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
  const [error, setError] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    setStatus(true);
    setError(false);
    setShowSkeleton(false);
    const timer = window.setTimeout(() => setShowSkeleton(true), 300);
    fetch(`/api/v1/stops/${id}`)
      .then((res) => {
        if (res.status === 404 || res.status === 400) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<StopDetail>;
      })
      .then(setStop)
      .catch(() => { setStop(null); setError(true); })
      .finally(() => { window.clearTimeout(timer); setStatus(false); });
    return () => window.clearTimeout(timer);
  }, [id]);

  if (status && !showSkeleton) return null;
  if (status) return (
    <div role="status" aria-label="Loading stop">
      <div aria-hidden="true">
        <div className="flex h-[72px] items-center gap-4">
          <div className="h-10 w-64 max-w-[60%] rounded bg-[#E1E8E9] motion-safe:animate-pulse" />
          <div className="h-9 w-9 rounded-full bg-[#E1E8E9] motion-safe:animate-pulse" />
        </div>
        <hr className="mt-2 w-full border-t border-[#E1E8E9]" />
        <div className="mt-[19px] flex flex-col items-start gap-2 lg:flex-row lg:items-stretch">
          <div className="aspect-[3/2] w-full max-w-[450px] rounded-[9px] bg-[#E1E8E9] motion-safe:animate-pulse lg:shrink-0 lg:self-start" />
          <div className="aspect-[1000/450] w-full lg:aspect-auto lg:min-w-0 lg:flex-1"><Scheme selectedId={Number(id)} /></div>
        </div>
        <h2 className="text-[#152D37] font-[500] text-[29px] pt-[29px]">Stop facilities</h2>
        <hr className="mt-2 w-full border-t border-[#E1E8E9]" />
        <dl className="mt-5 flex flex-wrap gap-x-12 gap-y-4">
          {["Step-free access", "Shelter", "Ticket machine"].map((label) => (
            <div key={label}>
              <dt className="text-[16px] text-[#5D7078]">{label}</dt>
              <dd className="flex h-[28px] items-center"><span className="h-5 w-12 rounded bg-[#E1E8E9] motion-safe:animate-pulse" /></dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
  if (error) return <p>Could not load stop. Please try again later.</p>;
  if (!stop) return (
    <div role="status" className="flex min-h-[calc(100dvh-40px)] flex-col justify-center py-8">
      <div className="flex max-w-[895px] flex-wrap items-start justify-between gap-6 pl-0 sm:pl-10">
        <div className="pt-6">
          <h1 className="text-[32px] leading-tight font-semibold text-[#152D37] sm:text-[41px]">We couldn't find this stop.</h1>
          <p className="mt-[13px] text-[21px] text-[#5D7078]">Check the address or explore the stop list.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/stops" className="inline-flex h-12 items-center justify-center rounded-[7px] bg-[#0070BB] px-6 text-[19px] font-semibold text-white transition-colors duration-200 ease-out hover:bg-[#005A8C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0070BB]">View all stops</Link>
            <button type="button" onClick={() => window.location.reload()} className="h-12 rounded-[7px] border border-[#0070BB] px-6 text-[19px] font-semibold text-[#0070BB] transition-colors duration-200 ease-out hover:bg-[#E3EEF4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0070BB]">Reload page</button>
          </div>
        </div>
        <img src={noResultsIcon} alt="" width="93" height="224" />
      </div>
    </div>
  );

  const stopLines = lines.filter((line) => line.stops.some((id) => id === stop.id));

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/stops" aria-label="Back to stop list" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E1E8E9] motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0070BB]">
          <img src={arrowBack} alt="" className="h-6 w-6" />
        </Link>
        <h1 className="text-[#152D37] font-[600] text-[48px]">{stop.name}</h1>
        <div className="flex items-center gap-2" aria-label={`Lines ${stopLines.map((line) => line.name).join(", ")}`}>
          {stopLines.map((line, index) => (
            <span key={line.name} className="flex items-center gap-2">
              {index > 0 && stop.is_transfer && <img src={transfer} alt="" className="h-6 w-6" />}
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-[20px] font-bold text-white" style={{ backgroundColor: line.color }}>{line.name}</span>
            </span>
          ))}
        </div>
      </div>
      <hr className="mt-2 w-full border-t border-[#E1E8E9]" />
      <div className="mt-[19px] flex flex-col items-start gap-2 lg:flex-row lg:items-stretch">
        <img className="h-auto w-full max-w-[450px] rounded-[9px] lg:shrink-0 lg:self-start" src={stop.image_url} alt={stop.name} />
        <div className="aspect-[1000/450] w-full lg:aspect-auto lg:min-w-0 lg:flex-1">
          <Scheme selectedId={stop.id} />
        </div>
      </div>
      <h2 className="text-[#152D37] font-[500] text-[29px] pt-[29px]">Stop facilities</h2>
      <hr className="mt-2 w-full border-t border-[#E1E8E9]" />
      <dl className="mt-5 flex flex-wrap gap-x-12 gap-y-4">
        {[
          ["Step-free access", stop.wheelchair_accessible],
          ["Shelter", stop.has_shelter],
          ["Ticket machine", stop.has_ticket_machine],
        ].map(([label, available]) => (
          <div key={String(label)}>
            <dt className="text-[16px] text-[#5D7078]">{label}</dt>
            <dd className="text-[20px] font-semibold text-[#152D37]">{available ? "Yes" : "No"}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
