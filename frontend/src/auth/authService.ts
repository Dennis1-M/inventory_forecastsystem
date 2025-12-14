import api from "../api/axios";
import type { LoginPayload, User } from "../types/auth";


export const login = async (
  payload: LoginPayload
): Promise<User> => {
  const res = await api.post<User>("/auth/login", payload);
  return res.data;
};
