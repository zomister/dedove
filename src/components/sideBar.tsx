import logo from "../assets/logo/SVG/Think-different-Academy_LOGO_oficialni_1.svg";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sections = [
  {
    title: "Stops",
    buttons: [
      {
        title: "All Stops",
        link: "/stops",
      }
    ]
  },
]

export default function SideBar() {
  const [hovered, setHovered] = useState<{ section: number; button: number; visible: boolean } | null>(null);
  const { pathname } = useLocation();
  const path = pathname.replace(/\/$/, "");
  const activeLink = path === "/stops/demo" ? path : path.startsWith("/stops/") ? "/stops" : path;
  return (
    <>
        <div className="w-[242px] min-h-screen bg-[#F4F7F6] px-[16px] pt-[36px]">
            <img src={logo} alt="Logo" className="w-full h-auto" />
            <div className="pt-[36px]">
                {Sections.map((section, index) => (
                    <div key={index} className="mb-4">
                        <h2 className="px-4 text-xs font-semibold uppercase tracking-wider text-[#5D7078]">{section.title}</h2>
                        <ul className="relative mt-2 flex flex-col gap-[3px]" onMouseLeave={() => setHovered((current) => current && { ...current, visible: false })} onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) setHovered((current) => current && { ...current, visible: false });
                        }}>
                            <li aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-11 rounded-[8px] bg-[#E3EEF4] transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none" style={{
                                transform: `translateY(${Math.max(0, section.buttons.findIndex((button) => button.link === activeLink)) * 47}px)`,
                                opacity: section.buttons.some((button) => button.link === activeLink) ? 1 : 0,
                            }} />
                            <li aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-11 rounded-[8px] bg-[#E3EEF4] transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none" style={{
                                transform: `translateY(${hovered?.section === index ? hovered.button * 47 : 0}px)`,
                                opacity: hovered?.section === index && hovered.visible ? 0.5 : 0,
                            }} />
                            {section.buttons.map((button, buttonIndex) => (
                                <li key={buttonIndex} className="relative">
                                    <NavLink end={button.link !== "/stops" || activeLink !== "/stops"} to={button.link} onMouseEnter={() => setHovered({ section: index, button: buttonIndex, visible: true })} onFocus={() => setHovered({ section: index, button: buttonIndex, visible: true })} className={`flex h-11 w-full items-center rounded-[8px] px-[16px] transition-[color,font-weight] duration-200 ease-out motion-reduce:transition-none hover:text-[#0070BB] hover:font-bold focus-visible:text-[#0070BB] focus-visible:font-bold ${button.link === activeLink ? "font-bold text-[#0070BB]" : "font-medium text-[#5D7078]"}`}>
                                        {button.title}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            
        </div>
    </>
  );
}
