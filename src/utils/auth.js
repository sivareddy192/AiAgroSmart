import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode(token); // { userId, email, iat, exp }
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

