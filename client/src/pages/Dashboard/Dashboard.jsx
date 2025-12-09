import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyForms, getBases, getTables } from "../../api/api";
import Navbar from "../../components/Navbar";
import "./Dashboard.css";

export default function Dashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Creation Modal State
  const [showModal, setShowModal] = useState(false);
  const [bases, setBases] = useState([]);
  const [selectedBase, setSelectedBase] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [loadingBases, setLoadingBases] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const data = await getMyForms();
      setForms(data);
    } catch (err) {
      console.error("Failed to load forms:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreationModal = async () => {
    setShowModal(true);
    setLoadingBases(true);
    try {
      const data = await getBases();
      setBases(data);
    } catch (err) {
      console.error("Failed to load bases:", err);
    } finally {
      setLoadingBases(false);
    }
  };

  const handleBaseChange = async (e) => {
    const baseId = e.target.value;
    setSelectedBase(baseId);
    setSelectedTable("");
    setTables([]);
    if (!baseId) return;

    setLoadingTables(true);
    try {
      const data = await getTables(baseId);
      setTables(data);
    } catch (err) {
      console.error("Failed to load tables:", err);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleStartBuilding = () => {
    if (selectedBase && selectedTable) {
      navigate(`/builder/${selectedBase}/${selectedTable}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper">
        <div className="dashboard-container container">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">My Forms</h1>
              <p className="dashboard-subtitle">Manage and track your Airtable forms.</p>
            </div>
            <button className="btn btn-primary" onClick={openCreationModal}>
              + Create New Form
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading your forms...</div>
          ) : forms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No forms yet</h3>
              <p>Create your first form connected to Airtable logic.</p>
              <button className="btn btn-secondary" onClick={openCreationModal}>Create Form</button>
            </div>
          ) : (
            <div className="forms-grid">
              {forms.map((form) => (
                <div key={form._id} className="form-card card">
                  <div className="form-card-header">
                    <h3 className="form-title">{form.title}</h3>
                    <span className="form-badge">Active</span>
                  </div>
                  <div className="form-card-actions">
                    <a href={`/form/${form._id}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Preview</a>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/responses/${form._id}`)}>Responses</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content card">
                <h2 className="modal-title">Create New Form</h2>

                <div className="form-group">
                  <label>Select Airtable Base</label>
                  <select className="form-select" value={selectedBase} onChange={handleBaseChange} disabled={loadingBases}>
                    <option value="">-- Select Base --</option>
                    {bases.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {loadingBases && <span className="loading-text">Loading bases...</span>}
                </div>

                {selectedBase && (
                  <div className="form-group">
                    <label>Select Table</label>
                    <select className="form-select" value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} disabled={loadingTables}>
                      <option value="">-- Select Table --</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    {loadingTables && <span className="loading-text">Loading tables...</span>}
                  </div>
                )}

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    disabled={!selectedBase || !selectedTable}
                    onClick={handleStartBuilding}
                  >
                    Start Building
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

dashboard.jsx
