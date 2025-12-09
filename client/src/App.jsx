import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import AuthCallback from "./pages/Login/AuthCallback";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

import FormBuilder from "./pages/FormBuilder/FormBuilder";
import FormViewer from "./pages/FormViewer/FormViewer";
import Responses from "./pages/Responses/Responses";
import "./index.css";
import "./App.css";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/builder/:baseId/:tableId" element={<FormBuilder />} />
      <Route path="/form/:formId" element={<FormViewer />} />
      <Route path="/responses/:formId" element={<Responses />} />
    </Routes>
  );
}

export default App;
