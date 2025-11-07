import { useState, type FC, useCallback } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";
import { Link } from "react-router-dom";
import XButton from "./XButton";
import { useAuth } from "../context/AuthContext";

const Sidebar: FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const close = useCallback(() => setIsOpen(false), []),
    toggle = useCallback(() => setIsOpen((o) => !o), []);

  const sidebarTabs = [
    { name: "Inicio", path: "/" },
    // { name: "Prensa", path: "/press" },
    { name: "Patrocinadores", path: "/sponsors" },
    { name: "Inscripciones", path: "/registrations" },
    { name: "Comités", path: "/committees" },
    ...(user?.isAdmin ? [{ name: "Panel Admin", path: "/admin" }] : []),
    { name: "Iniciar sesión", path: "/login" },
  ];

  return (
    <aside className="sm:hidden top-0 right-4 items-center justify-end fixed z-10">
      <button
        onClick={toggle}
        type="button"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className="pointer-events-auto z-50 p-4 rounded cursor-pointer transition-colors"
      >
        <CiMenuBurger size={32} />
      </button>

      {isOpen && (
        <div
          onClick={close}
          aria-hidden="true"
          className="fixed inset-0 z-40 opacity-100 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ease-in-out"
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 w-full max-w-xs min-h-screen bg-[#d53137] shadow-md transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú lateral"
      >
        <div className="flex justify-end p-3 relative">
          <img
            src="/logo-white.png"
            alt="Logo"
            className="h-12 w-auto absolute left-1/6 top-6 transform -translate-x-1/2"
          />
          <button onClick={close} aria-label="Cerrar menú" className="p-2">
            <XButton size={48} />
          </button>
        </div>
        <nav className="px-6 py-6">
          <ul className="flex flex-col gap-1 text-[#f0f0f0] text-2xl">
            {sidebarTabs
              .filter((tab) => tab.path !== "/login" || !user)
              .map((tab) => (
                <li key={tab.name}>
                  <Link
                    onClick={close}
                    className={`block py-4 font-montserrat-light text-[#f0f0f0] hover:text-gray-300 transition-colors ${
                      tab.path === "/admin"
                        ? "bg-black/20 rounded px-2 font-montserrat-bold"
                        : ""
                    }`}
                    to={tab.path}
                  >
                    {tab.name}
                  </Link>
                </li>
              ))}
          </ul>

          <div className="mt-4">
            {user && (
              <div className=" font-montserrat-light text-[#f0f0f0]">
                <span className="absolute bottom-20 left-4 text-sm">
                  {user.email}
                  {user.isAdmin && (
                    <span className="block text-xs text-yellow-300 font-montserrat-bold mt-1">
                      Administrador
                    </span>
                  )}
                </span>
                <span
                  onClick={logout}
                  className="absolute bottom-4 left-4 text-sm cursor-pointer flex items-center gap-2"
                >
                  <CiLogout size={28} className="mr-2" />
                  <p className="py-4  hover:text-gray-300 cursor-pointer m-0">
                    Cerrar sesión
                  </p>
                </span>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
