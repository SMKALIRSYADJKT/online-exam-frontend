import { useState, useEffect, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";

interface SearchBarProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search..." }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialValue = searchParams.get("search") || "";

  const [input, setInput] = useState<string>(initialValue);

  useEffect(() => {
    const debounce = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (input.trim()) {
        params.set("search", input);
        params.set("page", "1"); // reset ke halaman pertama
      } else {
        params.delete("search");
      }

      setSearchParams(params);
    }, 400);

    return () => clearTimeout(debounce);
  }, [input, setSearchParams]); // ❗ searchParams dihapus agar tidak loop

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={input}
      onChange={handleChange}
      className="w-full max-w-md px-4 py-2 border border-gray-200 rounded mb-4 focus:ring-2 focus:ring-emerald-400 outline-none"
    />
  );
};

export default SearchBar;
