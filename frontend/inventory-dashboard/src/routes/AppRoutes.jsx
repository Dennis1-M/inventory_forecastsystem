import Landing from "@/pages/Landing";
import Register from "@/pages/auth/Register";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import Login from "@/pages/auth/Login"; // future

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}
