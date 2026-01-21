import React, { useState, useEffect } from "react";
import Select, { type SingleValue } from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";

const MySwal = withReactContent(Swal);

interface Option {
  value: string | number;
  label: string;
}

interface SubjectSelectProps {
  subject: string | number | null;
  setSubject: (value: string | number | null) => void;
}

const SubjectSelect: React.FC<SubjectSelectProps> = ({ subject, setSubject }) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/subjects/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const newOptions: Option[] = res.data?.data.map((item: any) => ({
        value: item.id,
        label: `${item.name} - ${item.class_id}`,
      }));

      setOptions(newOptions);
    } catch (err) {
      MySwal.fire({
        title: "Error",
        text: "Gagal mengambil data mata pelajaran.",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Failed to fetch subject", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Select
      options={options}
      value={options.find((opt) => opt.value === subject) || null}
      onChange={(opt: SingleValue<Option>) => setSubject(opt?.value ?? null)}
      placeholder={loading ? "Loading..." : "Pilih Mata Pelajaran"}
      className="w-full py-1 px-2 bg-white rounded-full"
      isClearable
      isLoading={loading}
    />
  );
};

export default SubjectSelect;
