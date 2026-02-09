"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Home, MessageSquare, FileUp, LogOut, RefreshCw, AlertTriangle } from "lucide-react";

export default function DocumentsPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");
    if (!storedUser || !storedToken) {
      router.push("/login");
    } else {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, [router]);

  const fetchDocuments = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/documents/${user.username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchDocuments();
    }
  }, [user, token]);

  const confirmDelete = (doc) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    setDeleting(docToDelete.filename);
    setShowDeleteModal(false);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/documents/${user.username}/${encodeURIComponent(docToDelete.filename)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.filename !== docToDelete.filename));
      } else {
        const error = await res.json();
        alert(`Failed to delete: ${error.detail}`);
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Failed to delete document");
    } finally {
      setDeleting(null);
      setDocToDelete(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-gray-900 to-[#0F172A] text-white">
      {/* Navigation */}
      <nav className="w-full flex justify-between items-center px-6 py-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
        <div className="flex space-x-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-1 bg-gray-700/50 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 text-purple-300" />
            <span className="text-sm text-purple-300">Home</span>
          </button>
          <button
            onClick={() => router.push(`/ask/${user?.username}`)}
            className="flex items-center space-x-1 bg-gray-700/50 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-purple-300" />
            <span className="text-sm text-purple-300">Chat</span>
          </button>
          <button
            onClick={() => router.push(`/upload/${user?.username}`)}
            className="flex items-center space-x-1 bg-gray-700/50 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
          >
            <FileUp className="w-5 h-5 text-purple-300" />
            <span className="text-sm text-purple-300">Upload</span>
          </button>
        </div>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Knowledge Base
        </h1>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 bg-red-600/80 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 text-white" />
          <span className="text-sm text-white">Logout</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-purple-300">Your Documents</h2>
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Documents Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/30 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No documents yet</h3>
              <p className="text-gray-500 mb-4">Upload documents to build your knowledge base</p>
              <button
                onClick={() => router.push(`/upload/${user?.username}`)}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
              >
                Upload Documents
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Size</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Uploaded</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {documents.map((doc) => (
                  <tr key={doc.filename} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{formatFileSize(doc.size)}</td>
                    <td className="px-6 py-4 text-gray-400">{formatDate(doc.uploaded_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => confirmDelete(doc)}
                        disabled={deleting === doc.filename}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting === doc.filename ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span className="text-sm">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-600/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold">Delete Document</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{docToDelete?.filename}</span>?
              This will also remove it from the knowledge base.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
