export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "MANAGER" | "STAFF"| "ADMIN";
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
