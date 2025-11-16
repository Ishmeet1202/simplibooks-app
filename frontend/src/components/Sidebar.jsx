import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Expenses", href: "/expenses", icon: TrendingUp },
  ];

  const secondaryNavigation = [
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    // This sidebar will be fixed on desktop (lg screens) and hidden on mobile.
    // A separate button in your Header/Navbar would toggle its visibility on mobile.
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-700 bg-slate-800 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center gap-x-3">
          <span className="text-2xl font-bold text-indigo-400">🧾</span>
          <h1 className="text-xl font-bold text-slate-50">SimpliBooks</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {/* Main Navigation */}
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      // NavLink's function gives us isActive to conditionally apply classes
                      className={({ isActive }) =>
                        `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                          isActive
                            ? "bg-slate-700 text-indigo-400"
                            : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                        }`
                      }
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
            {/* Secondary Navigation */}
            <li>
              <div className="text-xs font-semibold leading-6 text-slate-400">
                Your Account
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {secondaryNavigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                          isActive
                            ? "bg-slate-700 text-indigo-400"
                            : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                        }`
                      }
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>

            {/* User Profile & Logout at the bottom */}
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-slate-300">
                <div className="flex-1">
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">{user?.name || "User"}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  <span className="sr-only">Logout</span>
                  <LogOut className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
