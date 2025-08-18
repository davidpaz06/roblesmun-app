import { useState, type FC, useCallback } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { Link } from "react-router-dom";
import XButton from "./XButton";

const Sidebar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  return (
    <aside className="sm:hidden w-[100%] flex items-center justify-end p-4 fixed z-10">
      <button
        onClick={toggle}
        type="button"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className="pointer-events-auto z-50 p-2 rounded cursor-pointer transition-colors"
      >
        <CiMenuBurger size={40} />
      </button>

      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-40 transition-opacity duration-500 ease-in-out
          ${isOpen ? "opacity-100 bg-black/50 backdrop-blur-sm" : "opacity-0"}`}
      />

      <div
        className={`fixed top-0 right-0 z-50 w-72 h-screen bg-[#ab0d13] shadow-md transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú lateral"
      >
        <div className="flex justify-end p-3 relative">
          <img
            src="src/assets/img/logo-white.png"
            alt="Logo"
            className="h-12 w-auto absolute left-1/6 top-6 transform -translate-x-1/2"
          />
          <button onClick={close} aria-label="Cerrar menú" className="p-2">
            <XButton size={48} />
          </button>
        </div>
        <nav className="px-6 py-6">
          <ul className="flex flex-col gap-1 text-white">
            <li>
              <Link
                onClick={close}
                className="block py-2 font-montserrat-light"
                to="/"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                onClick={close}
                className="block py-2 font-montserrat-light cursor-pointer"
                to="/press"
              >
                Prensa
              </Link>
            </li>
            <li>
              <Link
                onClick={close}
                className="block py-2 font-montserrat-light"
                to="/sponsors"
              >
                Patrocinadores
              </Link>
            </li>
            <li>
              <Link
                onClick={close}
                className="block py-2 font-montserrat-light"
                to="/registrations"
              >
                Inscripciones
              </Link>
            </li>
            <li>
              <Link
                onClick={close}
                className="block py-2 font-montserrat-light"
                to="/committees"
              >
                Comités
              </Link>
            </li>
            <li>
              <Link
                onClick={close}
                className="block py-2 font-montserrat-light"
                to="/login"
              >
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
