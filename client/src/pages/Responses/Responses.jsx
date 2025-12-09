
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getResponses, getForm } from "../../api/api";
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
        const [resData, formData] = await Promise.all([
          getResponses(formId),
          getForm(formId),
        ]);
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

  // Create column mapping
  const columns =
    form?.questions.map((q) => ({
      key: q.questionKey,
      label: q.label,
      type: q.type,
    })) || [];

  // --- Renders answer for each cell ---
  const renderAnswer = (value, type) => {
    if (!value) return "-";

    // MULTIPLE SELECT
    if (Array.isArray(value) && type !== "multipleAttachments") {
      return value.join(", ");
    }

    // FILE ATTACHMENTS
    if (type === "multipleAttachments") {
      if (!Array.isArray(value) || value.length === 0) return "No files";

      return (
        <div className="file-list-cell">
          {value.map((file, index) => (
            <div key={index}>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link"
              >
                📎 {file.name || "Download file"}
              </a>
            </div>
          ))}
        </div>
      );
    }

    // OBJECT (fallback)
    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    // NORMAL TEXT
    return value;
  };

  return (
    <>
      <Navbar />
      <div className="responses-wrapper">
        <div className="responses-container container">
          <div className="responses-header">
            <div>
              <h1 className="responses-title">Responses</h1>
              <p className="responses-subtitle">
                {form?.title || "Untitled Form"}
              </p>
            </div>
            <div className="response-count-badge">
              {responses.length} Submissions
            </div>
          </div>

          <div className="table-card card">
            <div className="table-responsive">
              {responses.length === 0 ? (
                <div className="empty-state-small">
                  No responses received yet.
                </div>
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
                        <td className="timestamp-cell">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span className={`status-badge ${r.status?.toLowerCase() || "pending"}`}>
                            {r.status || "Synced"}
                          </span>
                        </td>

                        {columns.map((col) => {
                          const value = r.answers[col.key];
                          return (
                            <td key={col.key}>
                              {renderAnswer(value, col.type)}
                            </td>
                          );
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

