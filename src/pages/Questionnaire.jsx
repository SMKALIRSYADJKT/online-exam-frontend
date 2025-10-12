import { useState, useEffect, Fragment } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import SearchBar from "../components/Users/SearchBar";
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
import { format } from "date-fns";

import QuestionnaireTable from "../components/Questionnaire/QuestionnaireTable";

const MySwal = withReactContent(Swal);

const Questionnaire = () => {
  const { examId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState({ total: 0 });
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "question";
  const order = searchParams.get("order") || "asc";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 10;

  const [formData, setFormData] = useState({
    id: "",
    exam_id: examId,
    question: "",
    options: [], // format baru: [{ type: "text", value: "..." }]
    answer: "",
    type: "multiple_choice",
    index: 0,
    created_at: new Date().toISOString(),
    updated_at: "",
  });

  // input handler umum
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ---------------- Option Handlers ---------------- */
  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { type: "text", value: "" }],
    }));
  };

  const updateOption = (index, field, value) => {
    setFormData((prev) => {
      const newOptions = [...prev.options];
      newOptions[index][field] = value;
      return { ...prev, options: newOptions };
    });
  };

  const removeOption = (index) => {
    setFormData((prev) => {
      const newOptions = prev.options.filter((_, i) => i !== index);
      return { ...prev, options: newOptions };
    });
  };

  const fetchQuestionnaires = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/api/exams/${examId}/questionnaires`,
        {
          params: { search, sort, order, page, limit: pageSize },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const metaInfo = res.data?.meta || { total: 0 };

      setQuestionnaires(list);
      setMeta(metaInfo);
      setTotal(metaInfo.total);
    } catch (err) {
      MySwal.fire({
        title: "Error",
        text: "Gagal mengambil data questionnaire.",
        icon: "error",
        confirmButtonText: "OK",
      });
      setQuestionnaires([]);
      setMeta({ total: 0 });
      setTotal(0);
      console.error("Failed to fetch questionnaires:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionnaires();
  }, [page, examId]);

  // tambah pertanyaan
  const handleSubmit = async () => {
    try {
      await axios.post(
        `http://localhost:3000/api/exams/${examId}/questionnaires`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setFormData({
        exam_id: examId,
        question: "",
        options: [],
        answer: "",
        type: "",
        index: 0,
        created_at: new Date().toISOString(),
      });

      setShowModal(false);

      MySwal.fire({
        title: "Berhasil!",
        text: `Pertanyaan berhasil ditambah.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchQuestionnaires();
    } catch (err) {
      MySwal.fire({
        title: "Gagal!",
        text: `Gagal menambah pertanyaan.`,
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
      setShowModal(false);
      console.error("Failed to add questionnaire:", err);
    }
  };

  // buka modal edit
  const handleEdit = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/questionnaires/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const q = res.data[0];
      if (q) {
        setFormData({
          id: q.id,
          exam_id: q.exam_id,
          question: q.question,
          options: q.options,
          answer: q.answer,
          type: q.type,
          index: q.index,
          created_at: q.created_at,
        });
        setSelectedId(q.id);
        setEditModalOpen(true);
      }
    } catch (err) {
      MySwal.fire({
        title: "Error",
        text: "Gagal mengambil data pertanyaan untuk diedit.",
        icon: "error",
        confirmButtonText: "OK",
      });
      setEditModalOpen(false);
      console.error("Failed to fetch questionnaire:", err);
    }
  };

  // update pertanyaan
  const handleUpdate = async () => {
    try {
      const updatedPayload = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      await axios.put(
        `http://localhost:3000/api/questionnaires/${selectedId}`,
        updatedPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setEditModalOpen(false);

      MySwal.fire({
        title: "Berhasil!",
        text: `Pertanyaan berhasil diperbarui.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchQuestionnaires();
    } catch (err) {
      MySwal.fire({
        title: "Gagal!",
        text: `Gagal memperbarui pertanyaan.`,
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
      setEditModalOpen(false);
      setSelectedId(null);
      console.error("Failed to update questionnaire:", err);
    }
  };

  return (
    <Sidebar>
      <div className="p-6 min-h-screen bg-white rounded shadow max-w-screen-xl mx-auto overflow-hidden">
        <h3 className="font-bold mb-4">Daftar Pertanyaan Ujian</h3>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-sm text-white font-semibold py-2 px-3 rounded"
          >
            + Tambah Pertanyaan
          </button>
        </div>

        {/* Modal Tambah */}
        <Transition appear show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setShowModal(false)}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-sm" />
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
                  <DialogPanel className="w-full max-w-md transform overflow-visible rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Tambah Pertanyaan Baru
                    </DialogTitle>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium">Pertanyaan</label>
                        <input
                          type="text"
                          name="question"
                          value={formData.question}
                          onChange={handleInputChange}
                          className="mt-1 w-full border border-2 border-gray-300 px-3 py-2 rounded"
                        />
                      </div>

                      {/* Pilih Tipe Pertanyaan */}
                      <div>
                        <label className="block text-sm font-medium">Tipe</label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="mt-1 w-full border border-2 border-gray-300 px-3 py-2 rounded bg-white"
                        >
                          <option value="">-- Pilih Tipe --</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>

                      {/* Pilihan Jawaban */}
                      {formData.type === "multiple_choice" && (
                        <div>
                          <label className="block text-sm font-medium">Pilihan Jawaban</label>
                          <div className="space-y-3 mt-2">
                            {formData.options.map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <select
                                  value={opt.type}
                                  onChange={(e) => updateOption(idx, "type", e.target.value)}
                                  className="border rounded px-2 py-1"
                                >
                                  <option value="text">Text</option>
                                  <option value="image">Image</option>
                                </select>
                                {opt.type === "text" ? (
                                  <input
                                    type="text"
                                    value={opt.value}
                                    onChange={(e) => updateOption(idx, "value", e.target.value)}
                                    placeholder={`Opsi ${idx + 1}`}
                                    className="flex-1 border rounded px-2 py-1"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={opt.value}
                                    onChange={(e) => updateOption(idx, "value", e.target.value)}
                                    placeholder="URL gambar"
                                    className="flex-1 border rounded px-2 py-1"
                                  />
                                )}
                                <button
                                  onClick={() => removeOption(idx)}
                                  className="px-2 py-1 bg-red-500 text-white rounded"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={addOption}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                            >
                              + Tambah Opsi
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium">Jawaban Benar</label>
                        <input
                          type="text"
                          name="answer"
                          value={formData.answer}
                          onChange={handleInputChange}
                          className="mt-1 w-full border border-2 border-gray-300 px-3 py-2 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">No Urut</label>
                        <input
                          type="number"
                          name="index"
                          value={formData.index}
                          onChange={handleInputChange}
                          className="mt-1 w-full border border-2 border-gray-300 px-3 py-2 rounded"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Table */}
        <SearchBar value={search} />
        {loading ? (
          <p className="mt-4">Loading...</p>
        ) : (
          <>
            <QuestionnaireTable
              data={questionnaires}
              onRefresh={fetchQuestionnaires}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              onEdit={handleEdit}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                {meta.total > 0 && (
                  <span>
                    Showing <strong>{(page - 1) * pageSize + 1}</strong> to{" "}
                    <strong>{Math.min(page * pageSize, meta.total)}</strong> of{" "}
                    <strong>{meta.total}</strong> entries
                  </span>
                )}
              </div>
              <Pagination
                current={page}
                total={meta.total}
                pageSize={pageSize}
                onPageChange={(p) => setSearchParams({ page: p })}
              />
            </div>
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default Questionnaire;
