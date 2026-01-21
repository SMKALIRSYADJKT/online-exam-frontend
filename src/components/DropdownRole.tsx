import React from "react";
import Select, { type SingleValue } from "react-select";

type Role = "SISWA" | "GURU" | "ADMIN";

interface Option {
  value: Role;
  label: string;
}

const options: Option[] = [
  { value: "SISWA", label: "Siswa" },
  { value: "GURU", label: "Guru" },
  { value: "ADMIN", label: "Admin" },
];

interface RoleSelectProps {
  role: Role | null;
  setRole: (value: Role | null) => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ role, setRole }) => {
  return (
    <Select
      options={options}
      value={options.find((opt) => opt.value === role) || null}
      onChange={(opt: SingleValue<Option>) => setRole(opt?.value ?? null)}
      placeholder="Pilih Role"
      className="w-full py-1 px-2 bg-white rounded-full"
      isClearable
    />
  );
};

export default RoleSelect;
