import type { FC } from "react";
import { Link } from "react-router-dom";
import {
  //   FaUsers,
  FaNewspaper,
  FaHandshake,
  FaGavel,
  FaClipboardList,
} from "react-icons/fa";

const AdminDashboard: FC = () => {
  const sections = [
    {
      title: "Prensa",
      icon: <FaNewspaper />,
      path: "/admin/press",
    },
    {
      title: "Patrocinadores",
      icon: <FaHandshake />,
      path: "/admin/sponsors",
    },
    {
      title: "Comités",
      icon: <FaGavel />,
      path: "/admin/committees",
    },
    {
      title: "Inscripciones",
      icon: <FaClipboardList />,
      path: "/admin/registrations",
    },
  ];

  return (
    <div className="p-4 min-h-screen w-full font-montserrat-light">
      <h1 className="m-0 text-4xl font-montserrat-bold">
        Panel de administración
      </h1>

      <Link
        to="/"
        className="px-6 py-2 my-4 w-fit bg-glass border border-gray-600 rounded-lg text-[#f0f0f0] hover:border-[#d53137] hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
      >
        Salir del Panel Admin
      </Link>

      <div className="flex flex-col gap-6 mt-8">
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className={`bg-glass p-2 shadow-lg hover:scale-101 transition-transform duration-200 flex flex-col items-center justify-center gap-4 text-white`}
          >
            <div className="text-4xl">{section.icon}</div>
            <h2 className="text-2xl font-montserrat-bold text-center">
              {section.title}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
