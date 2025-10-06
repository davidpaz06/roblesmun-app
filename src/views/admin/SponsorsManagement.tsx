import {
  useState,
  useEffect,
  type FC,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { Sponsor } from "../../interfaces/Sponsor";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaImage,
  FaSave,
  FaTimes,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaClock,
  FaHome,
} from "react-icons/fa";
import Loader from "../../components/Loader";
import { FirestoreService } from "../../firebase/firestore";
import { Link } from "react-router-dom";

type SortOption = "newest" | "oldest" | "alphabetical" | "reverse-alphabetical";

const SponsorsManagement: FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const [formData, setFormData] = useState<Sponsor>({
    name: "",
    logo: "",
    description: "",
  });

  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const data = await FirestoreService.getAll<Sponsor>("sponsors");
      console.log(data);
      setSponsors(data.length > 0 ? data : []);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para ordenar patrocinadores
  const sortSponsors = (
    sponsorsList: Sponsor[],
    option: SortOption
  ): Sponsor[] => {
    const sorted = [...sponsorsList];

    switch (option) {
      case "newest":
        return sorted.sort((a, b) => {
          // Asumiendo que tienen timestamp o usar el id
          const dateA = new Date(a.createdAt || a.id || "");
          const dateB = new Date(b.createdAt || b.id || "");
          return dateB.getTime() - dateA.getTime();
        });

      case "oldest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.id || "");
          const dateB = new Date(b.createdAt || b.id || "");
          return dateA.getTime() - dateB.getTime();
        });

      case "alphabetical":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case "reverse-alphabetical":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));

      default:
        return sorted;
    }
  };

  useEffect(() => {
    const sorted = sortSponsors(sponsors, sortOption);
    setFilteredSponsors(sorted);
  }, [sponsors, sortOption]);

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {};

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      description: "",
    });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(formData);
    try {
      if (editingId) {
        await FirestoreService.update("sponsors", editingId, {
          name: formData.name,
          logo: formData.logo,
          description: formData.description,
          updatedAt: new Date().toISOString(),
        });
        alert("Patrocinador actualizado exitosamente");
      } else {
        const sponsorData: Sponsor = {
          name: formData.name,
          logo: formData.logo,
          description: formData.description,
          createdAt: new Date().toISOString(),
        };

        const newId = await FirestoreService.add("sponsors", sponsorData);
        console.log("Nuevo patrocinador agregado con ID:", newId);
        alert("Patrocinador agregado exitosamente");
      }

      resetForm();
      await fetchSponsors();
    } catch (error) {
      console.error("Error al guardar patrocinador:", error);
      alert("Error al guardar patrocinador: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setFormData({
      name: sponsor.name,
      logo: sponsor.logo,
      description: sponsor.description,
    });
    setImagePreview(sponsor.logo);
    setEditingId(sponsor.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error("Invalid sponsor ID");
      return;
    }

    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este patrocinador?"
    );
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      await FirestoreService.delete("sponsors", id);
      alert("Patrocinador eliminado exitosamente");
      await fetchSponsors();
    } catch (error) {
      console.error("Error al eliminar patrocinador:", error);
      alert("Error al eliminar patrocinador: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const sortOptions: Array<{
    value: SortOption;
    label: string;
    icon: JSX.Element;
  }> = [
    { value: "newest", label: "Recientes", icon: <FaClock /> },
    { value: "oldest", label: "Antiguos", icon: <FaClock /> },
    { value: "alphabetical", label: "A-Z", icon: <FaSortAlphaDown /> },
    { value: "reverse-alphabetical", label: "Z-A", icon: <FaSortAlphaUp /> },
  ];

  return (
    <div className="p-12 font-montserrat-light w-full">
      <div className="p-0">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <div className="flex flex-col items-start">
            <h1 className="text-4xl font-montserrat-bold">Patrocinadores</h1>
            <Link
              to="/admin"
              className="px-6 py-2 my-4 bg-glass border border-gray-600 rounded-lg text-[#f0f0f0] hover:border-[#d53137] hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
            >
              <FaHome size={16} />
              Panel Admin
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#d53137] text-white cursor-pointer px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#d53137] transition-colors"
            >
              <FaPlus />
              {showForm ? "Cancelar" : "Nuevo Patrocinador"}
            </button>
          </div>

          {!isLoading && sponsors.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-sm text-gray-300 font-medium">
                Ordenar por:
              </span>
              <div className="flex gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`px-4 py-2 cursor-pointer rounded-lg flex items-center gap-2 text-sm transition-colors ${
                      sortOption === option.value
                        ? "bg-[#d53137] text-white"
                        : "bg-glass text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isLoading && sponsors.length > 0 && (
          <div className="mb-4 p-3 bg-glass rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              {sortOptions.find((option) => option.value === sortOption)?.icon}
              <span>
                Mostrando {filteredSponsors.length} patrocinadores ordenados
                por:{" "}
              </span>
              <span className="text-[#d53137] font-medium">
                {
                  sortOptions.find((option) => option.value === sortOption)
                    ?.label
                }
              </span>
            </div>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-glass p-6 rounded-lg mb-8"
          >
            <h2 className="text-2xl font-montserrat-bold mb-6">
              {editingId ? "Editar Patrocinador" : "Nuevo Patrocinador"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Nombre del patrocinador *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-glass text-[#f0f0f0] focus:border-[#d53137] outline-none transition-colors"
                    placeholder="Ej: Empresa XYZ"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={8}
                    className="w-full p-3 bg-glass text-[#f0f0f0] focus:border-[#d53137] outline-none resize-none transition-colors"
                    placeholder="Describe al patrocinador y su contribución al evento..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Logo del patrocinador *
                  </label>

                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-[#d53137] transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto max-h-48 max-w-full object-contain rounded-lg"
                        />
                        <div className="flex gap-2 justify-center">
                          <label className="bg-[#d53137] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#d53137] transition-colors flex items-center gap-2">
                            <FaImage />
                            Cambiar imagen
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setImagePreview("")}
                            className="bg-glass text-[#f0f0f0] px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <FaTimes />
                            Quitar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FaImage className="mx-auto text-6xl text-gray-400" />
                        <div>
                          <label className="bg-[#d53137] text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-[#d53137] transition-colors inline-flex items-center gap-2">
                            <FaImage />
                            Seleccionar imagen
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-sm text-gray-400">
                          Máximo 5MB • JPG, PNG, GIF, WebP
                        </p>
                      </div>
                    )}
                  </div>

                  {imageFile && (
                    <p className="text-sm text-gray-400 mt-2">
                      Archivo seleccionado: {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-[#242424]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#d53137] cursor-pointer text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaSave />
                {isSubmitting
                  ? "Guardando..."
                  : editingId
                  ? "Actualizar"
                  : "Guardar"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-glass text-[#f0f0f0] px-8 py-3 hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Cancelar
              </button>
            </div>
          </form>
        )}

        {isLoading && <Loader message="Cargando patrocinadores..." />}

        {!isLoading && (
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {filteredSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex-shrink-0 w-80 p-6 bg-glass transition-all duration-300 group"
                >
                  <div className="w-full h-40 flex items-center justify-center mb-4 bg-glass overflow-hidden">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA9TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPgo=";
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-montserrat-bold line-clamp-2 min-h-[3rem]">
                      {sponsor.name}
                    </h3>
                    <p className="text-sm text-gray-300 line-clamp-3 min-h-[4.5rem]">
                      {sponsor.description}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t border-[#242424]">
                    <button
                      onClick={() => handleEdit(sponsor)}
                      className="flex-1 bg-glass cursor-pointer text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <FaEdit />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor.id!)}
                      className="flex-1 bg-[#d53137] cursor-pointer text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && sponsors.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FaImage className="mx-auto text-8xl mb-6 opacity-30" />
            <h3 className="text-2xl font-montserrat-bold mb-2">
              No hay patrocinadores registrados
            </h3>
            <p className="text-lg mb-6">
              Haz clic en "Nuevo Patrocinador" para agregar el primero
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#d53137] text-white px-8 py-3 rounded-lg hover:bg-[#d53137] transition-colors inline-flex items-center gap-2"
            >
              <FaPlus />
              Agregar Patrocinador
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-glass">
          <div className="flex justify-between items-center text-sm">
            <span>Total de patrocinadores: {sponsors.length}</span>
            <span>Última actualización: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorsManagement;
