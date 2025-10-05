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
    <div className="p-8 min-h-screen w-full font-montserrat-light">
      <h1 className="m-4 text-4xl font-montserrat-bold">
        Panel de administración
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className={`bg-glass p-8 shadow-lg hover:scale-105 transition-transform duration-200 flex flex-col items-center justify-center gap-4 text-white`}
          >
            <div className="text-5xl">{section.icon}</div>
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
