import React from "react";
import Select, { type SingleValue } from "react-select";

interface Option {
  value: string;
  label: string;
}

const options: Option[] = [
  { value: "10AK", label: "Kelas 10 AK" },
  { value: "10TKJ", label: "Kelas 10 TKJ" },
  { value: "11AK", label: "Kelas 11 AK" },
  { value: "11TKJ", label: "Kelas 11 TKJ" },
  { value: "12AK", label: "Kelas 12 AK" },
  { value: "12TKJ", label: "Kelas 12 TKJ" },
];

interface ClassSelectProps {
  classes: string | null;
  setClasses: (value: string | null) => void;
}

const ClassSelect: React.FC<ClassSelectProps> = ({ classes, setClasses }) => {
  return (
    <Select
      options={options}
      value={options.find((opt) => opt.value === classes) || null}
      onChange={(opt: SingleValue<Option>) => setClasses(opt?.value ?? null)}
      placeholder="Pilih Kelas"
      className="w-full py-1 px-2 bg-white rounded-full"
      isClearable
    />
  );
};

export default ClassSelect;
