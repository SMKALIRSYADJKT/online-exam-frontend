import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios, { type AxiosError } from "axios";

interface LoginResponse {
  access_token: string;
}

const Login: React.FC = () => {
  const [userid, setUserid] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post<LoginResponse>(
        "http://localhost:3000/api/auth/login",
        {
          userid: userid.trim(),
          password: password,
        }
      );

      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      console.error("Login gagal:", axiosErr);

      setError(
        axiosErr.response?.data?.message ||
          "Login gagal, silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => navigate("/register");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen font-poppins">
      {/* Left image section */}
      <div
        className="hidden md:block bg-cover bg-center"
        style={{ backgroundImage: "url('/img/login-background-small.png')" }}
      ></div>

      {/* Right form section */}
      <div className="flex flex-col justify-center items-center bg-gray-50 px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 transition-all">
          <h2 className="text-2xl font-semibold text-emerald-600 text-center mb-8">
            Selamat Datang
          </h2>

          {error && (
            <div className="text-red-500 bg-red-50 border border-red-200 rounded-lg p-2 mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="NIS / NIK"
                className="w-full py-3 px-5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all"
                value={userid}
                onChange={(e) => setUserid(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full py-3 px-5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-sm text-gray-500 text-center">
              Belum punya akun?{" "}
              <span
                className="text-emerald-600 font-medium hover:underline cursor-pointer"
                onClick={handleRegister}
              >
                Register
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Sekolah Digital — All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
