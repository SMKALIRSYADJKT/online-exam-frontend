import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import RoleSelect from "../components/DropdownRole";
import axios, { type AxiosError } from "axios";

type UserRole = "SISWA" | "GURU" | "ADMIN" | null;

interface RegisterResponse {
  success: boolean;
  message?: string;
}

interface LoginResponse {
  success: boolean;
  access_token: string;
  message?: string;
}

const Register: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<UserRole>(null);
  const [nis, setNis] = useState<string>("");
  const [nik, setNik] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    if (!name || !role || !password) {
      setError("Silakan isi semua field!");
      setLoading(false);
      return;
    }

    const userid = nis || nik;

    try {
      // REGISTER
      const res = await axios.post<RegisterResponse>(
        "http://localhost:3000/api/auth/register",
        {
          name,
          userid,
          password,
          role,
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: userid,
        }
      );

      if (!res.data.success) {
        setError(res.data.message || "Registrasi gagal, silakan coba lagi.");
        setLoading(false);
        return;
      }

      // LOGIN OTOMATIS
      const login = await axios.post<LoginResponse>(
        "http://localhost:3000/auth/login",
        {
          userid,
          password,
        }
      );

      if (!login.data.success) {
        setError(login.data.message || "Login gagal, silakan coba lagi.");
        setLoading(false);
        return;
      }

      const token = login.data.access_token;
      localStorage.setItem("token", token);

      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          "Registrasi gagal, silakan coba lagi."
      );
      setLoading(false);
    }
  };

  const handleLogin = () => navigate("/");

  return (
    <div className="grid grid-cols-2">
      <div
        style={{ backgroundImage: "url('/img/login-background-small.png')" }}
        className="hidden md:block h-screen bg-cover bg-center"
      ></div>

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-12">
            <h3 className="text-xl font-bold text-neutral-600">Register</h3>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="mb-8">
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Name"
                className="w-full py-2 px-5 bg-white rounded-full mb-5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="mb-5">
                <RoleSelect role={role} setRole={setRole} />
              </div>

              {/* NIS untuk siswa */}
              <input
                type="text"
                placeholder="NIS"
                className={`w-full py-2 px-5 bg-white rounded-full mb-5 ${
                  role === "SISWA" ? "" : "hidden"
                }`}
                value={nis}
                onChange={(e) => setNis(e.target.value)}
              />

              {/* NIK untuk guru/admin */}
              <input
                type="text"
                placeholder="NIK"
                className={`w-full py-2 px-5 bg-white rounded-full mb-5 ${
                  role !== "SISWA" && role !== null ? "" : "hidden"
                }`}
                value={nik}
                onChange={(e) => setNik(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full py-2 px-5 bg-white rounded-full mb-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="mb-3">
                <span className="ps-2 text-gray-500 font-medium whitespace-nowrap">
                  Sudah punya akun?{" "}
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={handleLogin}
                  >
                    Sign in
                  </span>
                </span>
              </div>

              <div className="flex justify-center">
                <button
                  className={`bg-green-500 w-[150px] text-white py-2 px-4 rounded-full hover:bg-emerald-300 transition-colors duration-200 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  type="submit"
                >
                  {loading ? "Loading..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
