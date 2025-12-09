import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTables, createForm } from "../../api/api";
import Navbar from "../../components/Navbar";
import "./FormBuilder.css";

export default function FormBuilder() {
  const { baseId, tableId } = useParams();
  const navigate = useNavigate();

  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [formName, setFormName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Logic Modal State
  const [logicFieldId, setLogicFieldId] = useState(null);
  const [logicRules, setLogicRules] = useState({ logic: "AND", conditions: [] });

  useEffect(() => {
    loadFields();
  }, [baseId, tableId]);

  const loadFields = async () => {
    try {
      const tables = await getTables(baseId);
      const table = tables.find(t => t.id === tableId);
      if (table) {
        setFields(table.fields);
      } else {
        alert("Table not found or access denied.");
      }
    } catch (err) {
      console.error("Error loading fields:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (field) => {
    const exists = selectedFields.find((f) => f.id === field.id);
    if (exists) {
      setSelectedFields(selectedFields.filter((f) => f.id !== field.id));
    } else {
      setSelectedFields([
        ...selectedFields,
        {
          id: field.id,
          label: field.name,
          type: field.type,
          required: false,
          conditional: { logic: "AND", conditions: [] }
        }
      ]);
    }
  };

  const updateField = (id, updates) => {
    setSelectedFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const openLogicEditor = (fieldId) => {
    const field = selectedFields.find(f => f.id === fieldId);
    setLogicFieldId(fieldId);
    setLogicRules(field.conditional || { logic: "AND", conditions: [] });
  };

  const saveLogic = () => {
    updateField(logicFieldId, { conditional: logicRules });
    setLogicFieldId(null);
  };

  const addCondition = () => {
    setLogicRules({
      ...logicRules,
      conditions: [...logicRules.conditions, { questionKey: "", operator: "equals", value: "" }]
    });
  };

  const updateCondition = (index, key, value) => {
    const newConditions = [...logicRules.conditions];
    newConditions[index] = { ...newConditions[index], [key]: value };
    setLogicRules({ ...logicRules, conditions: newConditions });
  };

  const removeCondition = (index) => {
    const newConditions = logicRules.conditions.filter((_, i) => i !== index);
    setLogicRules({ ...logicRules, conditions: newConditions });
  };

  const handleSaveForm = async () => {
    if (!formName.trim()) return alert("Please enter a form name.");
    if (selectedFields.length === 0) return alert("Please select at least one field.");

    setSaving(true);
    const questions = selectedFields.map((f) => ({
      questionKey: f.id,
      airtableFieldId: f.id,
      label: f.label,
      type: f.type,
      required: f.required,
      conditional: f.conditional
    }));

    try {
      await createForm({
        title: formName,
        airtableBaseId: baseId,
        airtableTableId: tableId,
        questions
      });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to save form.");
    } finally {
      setSaving(false);
    }
  };

  // Get eligible fields for logic (fields appearing BEFORE the current one)
  const getEligibleLogicFields = (currentFieldId) => {
    const index = selectedFields.findIndex(f => f.id === currentFieldId);
    if (index <= 0) return [];
    return selectedFields.slice(0, index);
  };

  if (loading) return <div className="loading-state">Loading fields...</div>;

  return (
    <div className="builder-wrapper">
      <Navbar />
      <div className="builder-container container-fluid">
        <header className="builder-header">
          <input
            type="text"
            className="form-name-input"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Untitled Form"
          />
          <button className="btn btn-primary" onClick={handleSaveForm} disabled={saving}>
            {saving ? "Saving..." : "Save Form"}
          </button>
        </header>

        <main className="builder-layout">
          <aside className="builder-sidebar card">
            <h3 className="sidebar-title">Available Fields</h3>
            <p className="sidebar-subtitle">Click to add to form</p>
            <div className="fields-list">
              {fields.map((f) => {
                const isSelected = selectedFields.find(sf => sf.id === f.id);
                return (
                  <div
                    key={f.id}
                    className={`field-item ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleField(f)}
                  >
                    <div className="field-info">
                      <span className="field-name">{f.name}</span>
                      <span className="field-type-badge">{f.type}</span>
                    </div>
                    {isSelected && <span className="check-icon">✓</span>}
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="builder-canvas">
            <div className="canvas-header">
              <h3>Form Preview</h3>
            </div>
            {selectedFields.length === 0 ? (
              <div className="empty-canvas">
                <div className="empty-icon">📝</div>
                <p>Select fields from the sidebar to build your form.</p>
              </div>
            ) : (
              <div className="canvas-content">
                {selectedFields.map((f, index) => (
                  <div key={f.id} className="canvas-field-card card">
                    <div className="field-edit-header">
                      <span className="field-number">{index + 1}</span>
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => updateField(f.id, { label: e.target.value })}
                        className="field-label-edit"
                      />
                    </div>

                    <div className="field-controls">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={f.required}
                          onChange={(e) => updateField(f.id, { required: e.target.checked })}
                        />
                        Required
                      </label>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openLogicEditor(f.id)}
                      >
                        Conditional Logic {f.conditional?.conditions.length > 0 && `(${f.conditional.conditions.length})`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {logicFieldId && (
          <div className="modal-overlay">
            <div className="modal-content logic-modal card">
              <h3 className="modal-title">Logic Rules</h3>
              <p className="modal-subtitle">Show this question if:</p>

              <div className="logic-conditions">
                {logicRules.conditions.map((cond, idx) => (
                  <div key={idx} className="condition-row">
                    <select
                      className="form-select"
                      value={cond.questionKey}
                      onChange={(e) => updateCondition(idx, "questionKey", e.target.value)}
                    >
                      <option value="">Select Question</option>
                      {getEligibleLogicFields(logicFieldId).map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>

                    <select
                      className="form-select"
                      value={cond.operator}
                      onChange={(e) => updateCondition(idx, "operator", e.target.value)}
                    >
                      <option value="equals">Equals</option>
                      <option value="notEquals">Not Equals</option>
                      <option value="contains">Contains</option>
                    </select>

                    <input
                      type="text"
                      className="form-input"
                      value={cond.value}
                      onChange={(e) => updateCondition(idx, "value", e.target.value)}
                      placeholder="Value"
                    />

                    <button className="btn-icon-danger" onClick={() => removeCondition(idx)}>×</button>
                  </div>
                ))}
              </div>

              <div className="logic-footer">
                <button className="btn-link" onClick={addCondition}>+ Add Condition</button>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setLogicFieldId(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={saveLogic}>Save Rules</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
