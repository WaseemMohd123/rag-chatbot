"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Download, FileText } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !user) {
      router.push("/login");
    } else {
      setUser(user);
      setToken(token);
      fetchDocuments(user.username, token);
    }
  }, []);

  const fetchDocuments = async (username, token) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/documents/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please choose a file first!");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://127.0.0.1:8000/upload/${user.username}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      if (data.status === "success") {
        setMessage(`✅ Uploaded: ${data.filename || file.name}. ${data.message || ""}`);
        setFile(null);
        fetchDocuments(user.username, token); // Refresh list
      } else {
        setMessage("❌ Upload failed. " + (data.detail || ""));
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Check server logs.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold">Delete {filename}?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(
                  `http://127.0.0.1:8000/documents/${user.username}/${filename}`,
                  {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const data = await res.json();
                if (res.ok) {
                  toast.success(data.message);
                  fetchDocuments(user.username, token);
                } else {
                  toast.error(data.detail || "Delete failed");
                }
              } catch (err) {
                console.error(err);
                toast.error("Delete failed.");
              }
            }}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-white text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleDownload = (filename) => {
    window.open(
      `http://127.0.0.1:8000/documents/${user.username}/${filename}/download`,
      "_blank"
    );
  };

  const handleDownloadAll = () => {
    window.open(
      `http://127.0.0.1:8000/documents/${user.username}/download_all`,
      "_blank"
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleString();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-gray-900 to-[#0F172A] text-white flex flex-col items-center p-6">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Navigation bar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Document Management
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition duration-200"
        >
          Logout
        </button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1 bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700/30">
          <h2 className="text-2xl font-semibold text-purple-300 mb-4">Upload Document</h2>

          <label className="w-full flex items-center justify-center px-6 py-3 mb-4 bg-gray-800 text-gray-300 rounded-xl cursor-pointer hover:bg-gray-700 border border-gray-600 transition duration-200">
            Choose File
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>

          {file && (
            <p className="text-sm text-purple-300 mb-3 text-center">
              Selected: {file.name} ({formatFileSize(file.size)})
            </p>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-xl text-white mb-3 shadow-md disabled:opacity-60 transition duration-200"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {message && (
            <div className="w-full text-center p-3 rounded-lg bg-gray-800 mt-2 text-purple-200 text-sm">
              {message}
            </div>
          )}

          {user && (
            <button
              onClick={() => router.push(`/ask/${user.username}`)}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl text-white mt-6 shadow-md transition duration-200"
            >
              Go to Ask Page
            </button>
          )}
        </div>

        {/* Document List Section */}
        <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-purple-300">Your Documents</h2>
            {documents.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm shadow-md transition duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            )}
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet.</p>
              <p className="text-sm mt-2">Upload your first document to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-purple-300 font-semibold">
                      File Name
                    </th>
                    <th className="text-left py-3 px-4 text-purple-300 font-semibold">
                      Size
                    </th>
                    <th className="text-left py-3 px-4 text-purple-300 font-semibold">
                      Uploaded
                    </th>
                    <th className="text-left py-3 px-4 text-purple-300 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                    >
                      <td className="py-3 px-4 text-gray-300">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          {doc.filename}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {formatDate(doc.uploaded_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(doc.filename)}
                            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.filename)}
                            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
