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
import { SupabaseStorage } from "../../supabase/storage";
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
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  // ✅ Función para filtrar patrocinadores
  const filterSponsors = (
    sponsorsList: Sponsor[],
    search: string
  ): Sponsor[] => {
    if (!search.trim()) return sponsorsList;

    const searchLower = search.toLowerCase();
    return sponsorsList.filter(
      (sponsor) =>
        sponsor.name.toLowerCase().includes(searchLower) ||
        sponsor.description.toLowerCase().includes(searchLower)
    );
  };

  useEffect(() => {
    const filtered = filterSponsors(sponsors, searchTerm);
    const sorted = sortSponsors(filtered, sortOption);
    setFilteredSponsors(sorted);
  }, [sponsors, sortOption, searchTerm]);

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  // ✅ Manejar cambio de imagen con validaciones
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB");
      return;
    }

    setImageFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

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

    try {
      let logoUrl = formData.logo;

      // ✅ Subir imagen si hay una nueva
      if (imageFile) {
        try {
          logoUrl = await SupabaseStorage.uploadSponsorImage(imageFile);
          console.log("✅ Logo subido:", logoUrl);
        } catch (uploadError) {
          console.error("❌ Error subiendo logo:", uploadError);
          alert(
            "Error subiendo el logo. El patrocinador se guardará sin imagen."
          );
        }
      }

      const sponsorData = {
        name: formData.name,
        logo: logoUrl,
        description: formData.description,
      };

      if (editingId) {
        // ✅ Si hay imagen anterior y se cambió, eliminar la anterior
        const currentSponsor = sponsors.find((s) => s.id === editingId);
        if (
          currentSponsor?.logo &&
          imageFile &&
          currentSponsor.logo !== logoUrl
        ) {
          try {
            await SupabaseStorage.deleteSponsorImage(currentSponsor.logo);
            console.log("✅ Logo anterior eliminado");
          } catch (deleteError) {
            console.warn(
              "⚠️ No se pudo eliminar el logo anterior:",
              deleteError
            );
          }
        }

        await FirestoreService.update("sponsors", editingId, {
          ...sponsorData,
          updatedAt: new Date().toISOString(),
        });
        alert("Patrocinador actualizado exitosamente");
      } else {
        await FirestoreService.add("sponsors", {
          ...sponsorData,
          createdAt: new Date().toISOString(),
        });
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
      "¿Estás seguro de que deseas eliminar este patrocinador? Esta acción eliminará también su logo."
    );
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      // ✅ Eliminar imagen de Storage antes de eliminar el documento
      const sponsor = sponsors.find((s) => s.id === id);
      if (sponsor?.logo) {
        try {
          await SupabaseStorage.deleteSponsorImage(sponsor.logo);
          console.log("✅ Logo eliminado de Storage");
        } catch (deleteError) {
          console.warn("⚠️ No se pudo eliminar el logo:", deleteError);
        }
      }

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
            <p className="text-gray-400">
              Total de patrocinadores: {sponsors.length}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* ✅ Buscador */}
            <input
              type="text"
              placeholder="Buscar patrocinadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-glass border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#d53137] text-white cursor-pointer px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#b71c1c] transition-colors"
            >
              <FaPlus />
              {showForm ? "Cancelar" : "Nuevo Patrocinador"}
            </button>
          </div>
        </div>

        {/* Sorting Options */}
        {!isLoading && sponsors.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-sm text-gray-300 font-medium">
              Ordenar por:
            </span>
            <div className="flex gap-2 flex-wrap">
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

        {/* Form */}
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
                    className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
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
                    className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none resize-none"
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
                          <label className="bg-[#d53137] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#b71c1c] transition-colors flex items-center gap-2">
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
                            onClick={() => {
                              setImagePreview("");
                              setImageFile(null);
                            }}
                            className="bg-glass text-[#f0f0f0] px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
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
                          <label className="bg-[#d53137] text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-[#b71c1c] transition-colors inline-flex items-center gap-2">
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
                      Archivo seleccionado: {imageFile.name} (
                      {Math.round(imageFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-600">
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
                className="bg-glass text-[#f0f0f0] px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Loading */}
        {isLoading && <Loader message="Cargando patrocinadores..." />}

        {/* Sponsors Grid */}
        {!isLoading && (
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {filteredSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex-shrink-0 w-80 p-6 bg-glass rounded-lg border border-gray-700 hover:border-[#d53137] transition-all duration-300 group"
                >
                  <div className="w-full h-40 flex items-center justify-center mb-4 bg-[#101010] rounded overflow-hidden">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPgo=";
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

                  <div className="flex gap-2 mt-6 pt-4 border-t border-gray-600">
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

        {/* Empty States */}
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
              className="bg-[#d53137] text-white px-8 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors inline-flex items-center gap-2"
            >
              <FaPlus />
              Agregar Patrocinador
            </button>
          </div>
        )}

        {!isLoading && sponsors.length > 0 && filteredSponsors.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FaImage className="mx-auto text-8xl mb-6 opacity-30" />
            <h3 className="text-2xl font-montserrat-bold mb-2">
              No se encontraron patrocinadores
            </h3>
            <p className="text-lg mb-4">
              Intenta ajustar los términos de búsqueda
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="bg-[#d53137] text-white px-6 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-8 p-4 bg-glass rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-montserrat-bold text-[#f0f0f0]">
                {sponsors.length}
              </div>
              <div className="text-sm text-gray-400">Total Patrocinadores</div>
            </div>
            <div>
              <div className="text-2xl font-montserrat-bold text-blue-400">
                {filteredSponsors.length}
              </div>
              <div className="text-sm text-gray-400">Mostrando</div>
            </div>
            <div>
              <div className="text-2xl font-montserrat-bold text-green-400">
                {sponsors.filter((s) => s.logo).length}
              </div>
              <div className="text-sm text-gray-400">Con Logo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorsManagement;
