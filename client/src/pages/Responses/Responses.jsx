import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getResponses, getForm, updateResponseStatus } from "../../api/api";
import Navbar from "../../components/Navbar";
import "./Responses.css";

export default function Responses() {
  const { formId } = useParams();
  const [responses, setResponses] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resData, formData] = await Promise.all([getResponses(formId), getForm(formId)]);
        setResponses(resData || []);
        setForm(formData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [formId]);

  if (loading) return <div className="loading-state">Loading data...</div>;

  const columns =
    form?.questions.map((q) => ({
      key: q.questionKey,
      label: q.label,
      type: q.type,
    })) || [];

  const renderAnswer = (value, type) => {
    if (value === undefined || value === null || value === "") return "-";

    // MULTIPLE SELECT (array of strings)
    if (Array.isArray(value) && type !== "multipleAttachments") {
      return value.join(", ");
    }

    // FILE ATTACHMENTS: expect [{url, name}, ...] or array of urls
    if (type === "multipleAttachments") {
      if (!Array.isArray(value) || value.length === 0) return "No files";

      return (
        <div className="file-list-cell">
          {value.map((file, index) => {
            // file might be object or string
            const url = typeof file === "string" ? file : file.url;
            const name = typeof file === "string" ? file.split("/").pop() : file.name || "Download";
            return (
              <div key={index}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="file-link">
                  📎 {name}
                </a>
              </div>
            );
          })}
        </div>
      );
    }

    // OBJECT FALLBACK
    if (typeof value === "object") return JSON.stringify(value);

    // TEXT
    return String(value);
  };

  const handleStatusChange = async (responseId, newStatus) => {
    try {
      await updateResponseStatus(responseId, newStatus);
      setResponses((prev) => prev.map((r) => (r._id === responseId ? { ...r, status: newStatus } : r)));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  return (
    <>
      <Navbar />
      <div className="responses-wrapper">
        <div className="responses-container container">
          <div className="responses-header">
            <div>
              <h1 className="responses-title">Responses</h1>
              <p className="responses-subtitle">{form?.title || "Untitled Form"}</p>
            </div>
            <div className="response-count-badge">{responses.length} Submissions</div>
          </div>

          <div className="table-card card">
            <div className="table-responsive">
              {responses.length === 0 ? (
                <div className="empty-state-small">No responses received yet.</div>
              ) : (
                <table className="responses-table">
                  <thead>
                    <tr>
                      <th>Submitted At</th>
                      <th>Status</th>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {responses.map((r) => (
                      <tr key={r._id}>
                        <td className="timestamp-cell">{new Date(r.createdAt).toLocaleString()}</td>

                        <td>
                          <select
                            className="status-dropdown"
                            value={r.status || "Pending"}
                            onChange={(e) => handleStatusChange(r._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Reviewed">Reviewed</option>
                          </select>
                        </td>

                        {columns.map((col) => {
                          const value = r.answers?.[col.key];
                          return <td key={col.key}>{renderAnswer(value, col.type)}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
