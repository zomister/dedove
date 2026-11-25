import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import noResultsIcon from "../../assets/icons/vector/extern/no-results.svg";
import magnifyingGlass from "../../assets/icons/vector/extern/magnifying-glass.svg";
import cross from "../../assets/icons/vector/extern/cross.svg";

type Stop = {
    id: number;
    name: string;
    image_url: string | null;
    is_transfer: number;
    wheelchair_accessible: number;
    has_shelter: number;
    has_bench: number;
    has_ticket_machine: number;
    has_display: number;
};

function matchesStop(stop: Stop, query: string) {
    const words = [
        stop.name,
        stop.is_transfer && "transfer stop",
        stop.wheelchair_accessible && "wheelchair access accessible",
        stop.has_shelter && "shelter",
        stop.has_bench && "bench",
        stop.has_ticket_machine && "ticket machine",
        stop.has_display && "display",
    ].filter(Boolean).join(" ").toLowerCase().split(/\s+/);

    return query.toLowerCase().trim().split(/\s+/).every((word) => words.some((candidate) => candidate.startsWith(word)));
}

export default function Stops() {
    const [search, setSearch] = useState("");
    const [stops, setStops] = useState<Stop[]>([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [skeletonWidths] = useState(() => Array.from({ length: 4 }, () => 140 + Math.floor(Math.random() * 141)));
    useEffect(() => {
        fetch("/api/v1/stops/search")
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json() as Promise<Stop[]>;
            })
            .then(setStops)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const filteredStops = stops.filter((stop) => matchesStop(stop, search));
    const searchedTerm = search.length > 0 ? `Results for "${search}"` : "All stops";
    const num = filteredStops.length > 1 ? "stops" : "stop";

  return (
    <>
        <h1 className="text-[#152D37] font-[600] text-[48px] ">Stop list</h1>
        <h2 className="text-[#5D7078] font-[300] text-[20px] ">Find your right stops</h2>
        <hr className="mt-2 w-full border-t border-[#E1E8E9]" />
        <p className="text-[#5D7078] font-[400] text-[15px] pt-[24px] ">Search by name or type</p>
        <div className="relative mt-[8px]">
            <img src={magnifyingGlass} alt="" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
            <input
                type="text"
                aria-label="Search stops"
                placeholder="Search..."
                className="w-full rounded-[8px] bg-[#F4F7F6] py-[12px] pl-10 pr-12 focus:outline-none focus-visible:outline-1 focus-visible:outline-[#0070BB]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            {search.length > 0 && <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0070BB]">
                <img src={cross} alt="" className="h-4 w-4" />
            </button>}
        </div>
        <div className="flex items-center gap-3 mt-[24px]">
            <p className="text-[#152D37] font-[400] text-[24px]">{searchedTerm}</p>
            {!loading && filteredStops.length!=0 && <p className="text-[#5D7078] font-[300] text-[16px]">{filteredStops.length} {num}</p>}
        </div>
        {error ? <p>Could not load stops.</p> : loading ? (
            <div role="status" aria-label="Loading stops" className="mt-[15px]">
                {skeletonWidths.map((width, row) => (
                    <div key={row} aria-hidden="true" className="flex items-center gap-6 border-t border-[#E1E8E9] py-[17px] motion-safe:animate-pulse">
                        <div className="h-24 w-36 shrink-0 rounded-[7px] bg-[#E1E8E9]" />
                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                            <div className="h-7 max-w-full rounded bg-[#E1E8E9]" style={{ width }} />
                            <div className="h-4 w-full max-w-[680px] rounded bg-[#E1E8E9]" />
                        </div>
                    </div>
                ))}
            </div>
        ) : filteredStops.length === 0 ? (
            search.trim() ? (
                <div>
                <div role="status" className="flex max-w-[895px] flex-wrap items-start justify-between gap-6 pl-0 pt-[49px] sm:pl-10">
                    <div className="pt-6">
                        <h3 className="text-[32px] leading-tight font-semibold text-[#152D37] sm:text-[41px]">This is the end of the line.<br />Try another search.</h3>
                        <p className="mt-[13px] text-[21px] text-[#5D7078]">We couldn't find any stops for “{search}”.<br />Check the name or try a different search.</p>
                    </div>
                    <img src={noResultsIcon} alt="" width="93" height="224" />
                </div>
                <button type="button" onClick={() => setSearch("")} className="mt-[3px] h-12 w-[222px] rounded-[7px] bg-[#0070BB] text-[19px] font-semibold text-white transition-colors duration-200 ease-out hover:bg-[#005A8C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0070BB] sm:ml-10">Clear search</button>
                </div>
                
            ) : <p>No stops found.</p>
        ) : (
            <ul className="mt-[15px]">
                {filteredStops.map((stop) => (
                    <li key={stop.id} className="border-t border-[#E1E8E9] py-[17px]">
                        <Link to={`/stops/${stop.id}`} className="group flex flex-wrap items-center gap-x-6 gap-y-3">
                            {stop.image_url && <div className="h-24 w-36 shrink-0 overflow-hidden rounded-[7px]"><img className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-105" src={stop.image_url} alt="" /></div>}
                            <div className="min-w-0 flex-1">
                                <h3 className="text-[27px] font-semibold text-[#152D37]">{stop.name}</h3>
                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[14px] font-medium text-[#5D7078]">
                                    <span>Transfer stop: {stop.is_transfer ? "Yes" : "No"}</span>
                                    <span>Wheelchair access: {stop.wheelchair_accessible ? "Yes" : "No"}</span>
                                    <span>Shelter: {stop.has_shelter ? "Yes" : "No"}</span>
                                    <span>Bench: {stop.has_bench ? "Yes" : "No"}</span>
                                    <span>Ticket machine: {stop.has_ticket_machine ? "Yes" : "No"}</span>
                                    <span>Display: {stop.has_display ? "Yes" : "No"}</span>
                                </div>
                            </div>
                            <span className="flex shrink-0 items-center gap-1 text-[19px] font-semibold text-[#0070BB]">
                                Detail
                                <svg className="h-[19px] w-[19px] motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        )}
    </>
  );
}
