import { useEffect, useState } from "react";

export default function Navbar({
  connected,
  formattedFName,
  formattedLName,
}) {
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const logOut = () => {
    localStorage.removeItem("token");

    // Notify other tabs/windows
    localStorage.setItem("logout", Date.now().toString());

    setShowConfirmLogout(false);

    window.location.href = "/";
  };

  useEffect(() => {
    // Listen for logout event from other tabs
    const handleStorage = (event) => {
      if (event.key === "logout") {
        setShowConfirmLogout(false);
        window.location.href = "/";
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const firstInitial = formattedFName?.charAt(0).toUpperCase() || "D";
  const lastInitial = formattedLName?.charAt(0).toUpperCase() || "S";

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
              <path d="M15 18H9" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
              <circle cx="17" cy="18" r="2" />
              <circle cx="7" cy="18" r="2" />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Reflex
              </h1>

              {/* Connection Status */}
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${
                  connected
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  {connected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}

                  <span
                    className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                      connected ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                </span>

                {connected ? "Online" : "Offline"}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Dispatcher Portal
            </p>
          </div>
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">

            {/* Avatar */}
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-white">
              {firstInitial}
              {lastInitial}
            </div>

            {/* Name */}
            <div className="text-sm">
              <p className="font-medium text-slate-900 leading-tight">
                {`${formattedFName || "Reflex"} ${
                  formattedLName || "Rider"
                }`}
              </p>

              <p className="text-xs text-slate-500">
                Rider
              </p>

            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all"
            onClick={() => setShowConfirmLogout(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>

            Logout
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showConfirmLogout && (
        <ConfirmLogoutModal
          setShowConfirmLogout={setShowConfirmLogout}
          logOut={logOut}
        />
      )}
    </header>
  );
}


function ConfirmLogoutModal({
  setShowConfirmLogout,
  logOut,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

        {/* Icon & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Confirm Logout
          </h3>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Are you sure you want to log out of your account? You will need
            to sign in again to access your dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Cancel */}
          <button
            type="button"
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            onClick={() => setShowConfirmLogout(false)}
          >
            Cancel
          </button>

          {/* Logout */}
          <button
            type="button"
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-200 flex items-center justify-center gap-2"
            onClick={logOut}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>

            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
}