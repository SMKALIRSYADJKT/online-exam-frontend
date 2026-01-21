import {
  useState,
  useEffect,
  Fragment,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios, { type AxiosError } from "axios";
import SearchBar from "../components/Users/SearchBar";
import QuestionnaireTable from "../components/Questionnaire/QuestionnaireTable";
import Pagination from "../components/Paginate";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { FaQuestionCircle } from "react-icons/fa";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface OptionItem {
  value: string;
}

interface QuestionnaireItem {
  id: number;
  question: string;
  type: string;
  options: OptionItem[];
  answer: string;
  index: number;
}

interface Meta {
  total: number;
}

interface FormData {
  question: string;
  type: string;
  options: OptionItem[];
  answer: string;
  index: number;
}

// --------------------------------------------------
// INITIAL FORM DATA
// --------------------------------------------------

const initialFormData: FormData = {
  question: "",
  type: "multiple_choice",
  options: [],
  answer: "",
  index: 0,
};

const MySwal = withReactContent(Swal);

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

const Questionnaire: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [questionnaires, setQuestionnaires] = useState<QuestionnaireItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [meta, setMeta] = useState<Meta>({ total: 0 });

  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 10;

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedId(null);
  };

  // --------------------------------------------------
  // INPUT HANDLERS
  // --------------------------------------------------

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addOption = () =>
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { value: "" }],
    }));

  const removeOption = (i: number) =>
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== i),
    }));

  const updateOption = (i: number, value: string) => {
    const opts = [...formData.options];
    opts[i].value = value;
    setFormData((prev) => ({ ...prev, options: opts }));
  };

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  const fetchQuestionnaires = async () => {
    setLoading(true);
    try {
      const res = await axios.get<{
        data: QuestionnaireItem[];
        meta: Meta;
      }>(`http://localhost:3000/api/exams/${examId}/questionnaires`, {
        params: { search, page, limit: pageSize },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setQuestionnaires(Array.isArray(res.data?.data) ? res.data.data : []);
      setMeta(res.data?.meta || { total: 0 });
    } catch (err) {
      MySwal.fire({
        title: "Error",
        text: "Gagal mengambil data pertanyaan.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionnaires();
  }, [page]);

  // --------------------------------------------------
  // SUBMIT NEW QUESTION
  // --------------------------------------------------

  const handleSubmit = async () => {
    try {
      await axios.post(
        `http://localhost:3000/api/exams/${examId}/questionnaires`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setShowModal(false);
      MySwal.fire({
        title: "Berhasil!",
        text: `Pertanyaan berhasil ditambahkan.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchQuestionnaires();
    } catch {
      MySwal.fire({
        title: "Gagal!",
        text: `Tidak dapat menambah pertanyaan.`,
        icon: "error",
      });
    }
  };

  // --------------------------------------------------
  // EDIT QUESTION
  // --------------------------------------------------

  const handleEdit = async (id: string | number) => {
    try {
      const res = await axios.get<QuestionnaireItem>(
        `http://localhost:3000/api/exams/${examId}/questionnaires/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const q = res.data;
      setFormData({
        question: q.question,
        type: q.type,
        options: q.options || [],
        answer: q.answer,
        index: q.index,
      });

      setSelectedId(q.id);
      setEditModalOpen(true);
    } catch {
      MySwal.fire({
        title: "Error",
        text: "Gagal mengambil data pertanyaan untuk diedit.",
        icon: "error",
      });
    }
  };

  // --------------------------------------------------
  // UPDATE QUESTION
  // --------------------------------------------------

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/exams/${examId}/questionnaires/${selectedId}`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setEditModalOpen(false);
      MySwal.fire({
        title: "Berhasil!",
        text: "Pertanyaan berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchQuestionnaires();
    } catch {
      MySwal.fire({
        title: "Gagal!",
        text: "Tidak dapat memperbarui pertanyaan.",
        icon: "error",
      });
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <Sidebar>
      <div className="p-8 bg-gray-50 min-h-screen rounded-2xl shadow-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
              <FaQuestionCircle className="text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Daftar Pertanyaan Ujian
            </h3>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all"
          >
            + Tambah Pertanyaan
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <SearchBar />

          {loading ? (
            <div className="mt-6 animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <>
              <QuestionnaireTable
                data={questionnaires}
                onRefresh={fetchQuestionnaires}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                onEdit={handleEdit}
              />

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  {meta.total > 0 && (
                    <span>
                      Menampilkan{" "}
                      <strong>{(page - 1) * pageSize + 1}</strong> -{" "}
                      <strong>{Math.min(page * pageSize, meta.total)}</strong>{" "}
                      dari <strong>{meta.total}</strong> pertanyaan
                    </span>
                  )}
                </div>

                <Pagination
                  current={page}
                  total={meta.total}
                  pageSize={pageSize}
                  onPageChange={(p) => setSearchParams({ page: String(p) })}
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Tambah/Edit */}
        <Transition appear show={showModal || editModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => {
              setShowModal(false);
              setEditModalOpen(false);
              resetForm();
            }}
          >
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-md transform rounded-2xl bg-white/90 backdrop-blur-md p-6 text-left align-middle shadow-2xl border border-gray-200 transition-all">
                    <DialogTitle
                      as="h3"
                      className="text-xl font-semibold text-gray-800 mb-4"
                    >
                      {showModal ? "Tambah Pertanyaan Baru" : "Edit Pertanyaan"}
                    </DialogTitle>

                    <div className="space-y-4">
                      {/* Pertanyaan */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Pertanyaan
                        </label>
                        <input
                          type="text"
                          name="question"
                          value={formData.question}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                        />
                      </div>

                      {/* Tipe */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tipe
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                        >
                          <option value="multiple_choice">Pilihan Ganda</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>

                      {/* Pilihan Jawaban */}
                      {formData.type === "multiple_choice" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Pilihan Jawaban
                          </label>

                          <div className="mt-2 space-y-2">
                            {formData.options.map((opt: { value: string }, i: number) => (
                              <div key={i} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={opt.value}
                                  onChange={(e) => updateOption(i, e.target.value)}
                                  placeholder={`Opsi ${i + 1}`}
                                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                                />

                                <button
                                  onClick={() => removeOption(i)}
                                  className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}

                            <button
                              onClick={addOption}
                              className="px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                            >
                              + Tambah Opsi
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Jawaban Benar */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Jawaban Benar
                        </label>
                        <input
                          type="text"
                          name="answer"
                          value={formData.answer}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                        />
                      </div>

                      {/* Nomor Urut */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Nomor Urut
                        </label>
                        <input
                          type="number"
                          name="index"
                          value={formData.index}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setEditModalOpen(false);
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                      >
                        Batal
                      </button>

                      <button
                        onClick={showModal ? handleSubmit : handleUpdate}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                      >
                        {showModal ? "Simpan" : "Perbarui"}
                      </button>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Sidebar>
  );
};

export default Questionnaire;
