import { Outlet } from "react-router-dom";
import SideBar from "./sideBar";

export default function Layout() {
  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="shrink-0 overflow-y-auto">
        <SideBar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-auto px-[56px] pt-[40px] [scrollbar-color:#0070BB_transparent] [scrollbar-width:thin]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
