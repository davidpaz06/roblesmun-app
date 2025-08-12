import type { FC } from "react";
import { Link } from "react-router-dom";

const Header: FC = () => {
  return (
    <header className="mt-12 bg-[#ab0d13] w-[90%] min-w-[640px] rounded-lg absolute left-1/2 transform -translate-x-1/2 text-white font-montserrat-light">
      <ul className="flex items-center justify-around">
        <li className="p-2">
          <Link className="text-white cursor-pointer" to="/">
            <img
              src="src/assets/img/logo-white.png"
              alt="Logo"
              className="h-12 w-auto"
            />
          </Link>
        </li>
        <li className="p-2">
          <Link className="text-white cursor-pointer" to="/prensa">
            PRENSA
          </Link>
        </li>
        <li className="p-2">
          <Link className="text-white cursor-pointer" to="/patrocinadores">
            PATROCINADORES
          </Link>
        </li>
        <li className="p-2">
          <Link className="text-white cursor-pointer" to="/inscripciones">
            INSCRIPCIONES
          </Link>
        </li>
        <li className="p-2">
          <Link className="text-white cursor-pointer" to="/comites">
            COMITÉS
          </Link>
        </li>
        <li className="p-2">
          <Link className="text-white cursor-pointer" to="/login">
            INICIAR SESIÓN
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;
