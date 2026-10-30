import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AntdProvider } from "./components/antd";
import { ThemeProvider } from "./theme/ThemeProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import PostEditor from "./pages/PostEditor";
import Taxonomy from "./pages/Taxonomy";
import Photos from "./pages/Photos";
import Comments from "./pages/Comments";
import Moments from "./pages/Moments";
import SettingsPage from "./pages/Settings";

export default function App() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("davaid-admin-auth") === "1",
  );

  if (!authed) {
    return (
      <ThemeProvider>
        <AntdProvider>
          <Login onLogin={() => setAuthed(true)} />
        </AntdProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AntdProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout onLogout={() => setAuthed(false)} />}>
              <Route index element={<Dashboard />} />
              <Route path="/posts" element={<Posts />} />
              <Route
                path="/posts/new"
                element={<PostEditor isCreate={true} />}
              />
              <Route path="/posts/:id" element={<PostEditor />} />
              <Route path="/taxonomy" element={<Taxonomy />} />
              <Route path="/photos" element={<Photos />} />
              <Route path="/comments" element={<Comments />} />
              <Route path="/moments" element={<Moments />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntdProvider>
    </ThemeProvider>
  );
}
