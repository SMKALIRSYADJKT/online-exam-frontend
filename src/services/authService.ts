import { supabase } from "../../supabase/client";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions, type Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "your-secret-key";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  process.env.JWT_EXPIRES_IN ? Number(process.env.JWT_EXPIRES_IN) : 86400;

const TABLE_NAME = "users";

// ---------------- Types ----------------
export interface RegisterPayload {
  userid: string;
  password: string;
  name: string;
  role: string;
}

export interface LoginPayload {
  userid: string;
  password: string;
}

export interface User {
  id: string | number;
  userid: string;
  password_hash: string;
  name: string;
  role: string;
  nis_nik?: string;
  nama?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

// ---------------- Register ----------------
export const registerUser = async ({
  userid,
  password,
  name,
  role,
}: RegisterPayload): Promise<AuthResponse> => {
  try {
    const { data: existing } = await supabase
      .from(TABLE_NAME)
      .select("id")
      .eq("userid", userid)
      .single();

    if (existing) {
      throw new Error("NIS/NIK sudah terdaftar");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const { error } = await supabase.from(TABLE_NAME).insert([
      {
        userid,
        password_hash: hashedPassword,
        name,
        role,
        created_at: new Date().toISOString(),
        created_by: userid,
      },
    ]);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};

// ---------------- Login ----------------
export const loginUser = async ({
  userid,
  password,
}: LoginPayload): Promise<AuthResponse> => {
  try {
    const { data: user, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("userid", userid)
      .single<User>();

    if (error || !user) {
      throw new Error("NIS/NIK tidak ditemukan");
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      throw new Error("Password salah");
    }

    const signOptions: SignOptions = {
      expiresIn: JWT_EXPIRES_IN,
    };

    const token = jwt.sign(
      {
        id: user.id,
        nis_nik: user.nis_nik,
        nama: user.nama,
        role: user.role,
      },
      JWT_SECRET,
      signOptions
    );

    return { success: true, user, token };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};
