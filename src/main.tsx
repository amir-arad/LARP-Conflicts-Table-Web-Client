import "./index.css";

import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import ConflictsTableTool from "./conflicts-table-tool";
import React from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <nav className="bg-indigo-600">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<ConflictsTableTool />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
