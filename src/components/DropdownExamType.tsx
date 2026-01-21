import React from "react";
import Select, { type SingleValue } from "react-select";

interface Option {
  value: "REGULER" | "REMEDIAL";
  label: string;
}

const options: Option[] = [
  { value: "REGULER", label: "Reguler" },
  { value: "REMEDIAL", label: "Remedial" },
];

interface ExamTypeSelectProps {
  type: "REGULER" | "REMEDIAL" | null;
  setType: (value: "REGULER" | "REMEDIAL" | null) => void;
}

const ExamTypeSelect: React.FC<ExamTypeSelectProps> = ({ type, setType }) => {
  return (
    <Select
      options={options}
      value={options.find((opt) => opt.value === type) || null}
      onChange={(opt: SingleValue<Option>) => setType(opt?.value ?? null)}
      placeholder="Pilih Tipe Ujian"
      className="w-full py-1 px-2 bg-white rounded-full"
      isClearable
    />
  );
};

export default ExamTypeSelect;
