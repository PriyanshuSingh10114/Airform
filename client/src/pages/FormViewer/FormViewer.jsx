import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getForm, submitResponse } from "../../api/api";
import { shouldShowQuestion } from "../../utils/logicEngine";
import "./FormViewer.css";

export default function FormViewer() {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      const data = await getForm(formId);
      setForm(data);

      const initialAnswers = {};
      const initialFiles = {};

      data.questions.forEach((q) => {
        if (q.type === "multipleSelects") initialAnswers[q.questionKey] = [];
        else initialAnswers[q.questionKey] = "";

        if (q.type === "multipleAttachments") initialFiles[q.questionKey] = [];
      });

      setAnswers(initialAnswers);
      setFiles(initialFiles);
    } catch (err) {
      console.error("Failed to load form:", err);
      setError("Form not found or failed to load.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectChange = (key, option) => {
    setAnswers((prev) => {
      const current = prev[key] || [];
      if (current.includes(option)) {
        return { ...prev, [key]: current.filter((o) => o !== option) };
      } else {
        return { ...prev, [key]: [...current, option] };
      }
    });
  };

  const handleFileChange = (key, selectedFiles) => {
    setFiles((prev) => ({
      ...prev,
      [key]: Array.from(selectedFiles),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    for (const q of form.questions) {
      if (shouldShowQuestion(q.conditional, answers)) {
        if (q.required) {
          const val = answers[q.questionKey];
          const fileVal = files[q.questionKey];

          if (q.type === "multipleAttachments") {
            if (!fileVal || fileVal.length === 0) {
              setError(`"${q.label}" requires at least one file.`);
              return;
            }
          } else if (!val || (Array.isArray(val) && val.length === 0)) {
            setError(`"${q.label}" is required.`);
            return;
          }
        }
      }
    }

    try {
      setSubmitting(true);

      // Build FormData for submission
      const formData = new FormData();

      // Add text answers
      Object.entries(answers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      // Add files
      Object.entries(files).forEach(([key, fileList]) => {
        if (fileList.length > 0) {
          fileList.forEach((file) => formData.append(key, file));
        }
      });

      // ADD DEFAULT STATUS HERE 👇
      formData.append("status", "Pending");

      await submitResponse(formId, formData);

      alert("Thank you! Your response has been recorded.");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Failed to submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="viewer-loading">Loading form...</div>;
  if (!form) return <div className="viewer-error">{error || "Form not found"}</div>;

  return (
    <div className="viewer-wrapper">
      <div className="viewer-container">
        <div className="form-card card">
          <header className="form-header">
            <h1 className="form-title">{form.title}</h1>
            <div className="form-meta">
              Fields marked with <span className="req">*</span> are required
            </div>
          </header>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="form-content">

            {form.questions.map((q) => {
              const isVisible = shouldShowQuestion(q.conditional, answers);
              if (!isVisible) return null;

              return (
                <div key={q.questionKey} className="question-block">
                  <label className="question-label">
                    {q.label} {q.required && <span className="req">*</span>}
                  </label>

                  {/* Text input */}
                  {q.type === "singleLineText" && (
                    <input
                      type="text"
                      className="form-input"
                      value={answers[q.questionKey] || ""}
                      onChange={(e) =>
                        handleChange(q.questionKey, e.target.value)
                      }
                      placeholder="Type your answer..."
                    />
                  )}

                  {/* Textarea */}
                  {q.type === "multilineText" && (
                    <textarea
                      className="form-textarea"
                      value={answers[q.questionKey] || ""}
                      onChange={(e) =>
                        handleChange(q.questionKey, e.target.value)
                      }
                      rows={4}
                      placeholder="Type your answer..."
                    />
                  )}

                  {/* Single select */}
                  {q.type === "singleSelect" && (
                    <select
                      className="form-select"
                      value={answers[q.questionKey] || ""}
                      onChange={(e) =>
                        handleChange(q.questionKey, e.target.value)
                      }
                    >
                      <option value="">Select an option</option>
                      {q.options?.map((opt) => (
                        <option key={opt.id || opt} value={opt.name || opt}>
                          {opt.name || opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Multi select */}
                  {q.type === "multipleSelects" && (
                    <div className="multi-select-options">
                      {["Approved", "Rejected", "Pending", "Reviewed"].map((opt) => (
                        <label key={opt} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={answers[q.questionKey]?.includes(opt)}
                            onChange={() => handleMultiSelectChange(q.questionKey, opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}


                  {/* File Upload */}
                  {q.type === "multipleAttachments" && (
                    <div className="file-upload-block">
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          handleFileChange(q.questionKey, e.target.files)
                        }
                      />
                      {files[q.questionKey]?.length > 0 && (
                        <ul className="file-preview-list">
                          {files[q.questionKey].map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="form-footer">
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Response"}
              </button>
            </div>
          </form>
        </div>

        <div className="viewer-footer">
          Powered by <strong>AirForm</strong>
        </div>
      </div>
    </div>
  );
}
