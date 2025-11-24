import { useAuth } from "../contexts/AuthContext";
import { Menu } from "lucide-react";

const Header = ({ setSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-700 bg-slate-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Hamburger menu button for mobile */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-300 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex-1 text-sm font-semibold leading-6 text-slate-50 lg:hidden">
        Dashboard
      </div>

      <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-x-3">
            <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="hidden lg:flex lg:flex-col lg:items-end">
              <span className="text-sm font-semibold text-slate-50">
                {user?.name}
              </span>
              <span className="text-xs text-slate-400">Freelancer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
