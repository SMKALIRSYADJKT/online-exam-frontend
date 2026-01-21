import React from "react";
import Select, { type SingleValue } from "react-select";

interface Option {
  value: "L" | "P";
  label: string;
}

const options: Option[] = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

interface GenderSelectProps {
  gender: "L" | "P" | null;
  setGender: (value: "L" | "P" | null) => void;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ gender, setGender }) => {
  return (
    <Select
      options={options}
      value={options.find((opt) => opt.value === gender) || null}
      onChange={(opt: SingleValue<Option>) => setGender(opt?.value ?? null)}
      placeholder="Pilih Jenis Kelamin"
      className="w-full py-1 px-2 bg-white rounded-full"
      isClearable
    />
  );
};

export default GenderSelect;
