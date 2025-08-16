import { Outlet } from "react-router-dom";
import SideMenu from "@/components/SideMenu";

export function Layout() {
  return (
    <div>
      <SideMenu />
      <Outlet />
    </div>
  );
}

export default Layout;
