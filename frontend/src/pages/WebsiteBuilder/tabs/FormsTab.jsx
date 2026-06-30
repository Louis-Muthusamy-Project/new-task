import React, { useState, useEffect } from "react";
import { Button, Input, Table, Typography, Space, Select, DatePicker, Card, Row, Col, Modal, Checkbox, Tag, Radio } from "antd";
import { Plus, Search, X, ArrowUp, ArrowDown, Edit3, Copy, HelpCircle, FileText, BarChart3, Inbox, Calendar, Link2, ListPlus, MousePointerClick, CheckSquare, Upload, Type, EyeOff, Hash, AlignLeft, List, ChevronDown, Menu } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import formTemplates from "../../../data/formTemplates.json";

const { Title, Text } = Typography;
const { Option } = Select;

const FormBuilderView = ({ activeForm, setActiveForm, itemVariants }) => {
  const [fields, setFields] = useState(
    activeForm?.from === "scratch" ? [] : (activeForm?.fields?.length ? activeForm.fields.map(f => ({
      id: f.id,
      type: f.type,
      label: f.label,
      placeholder: f.placeholder,
      required: f.required,
      options: f.options || []
    })) : [
      { id: "1", type: "Text Field", label: "First Name", placeholder: "Jane", required: true },
      { id: "2", type: "Text Field", label: "Last Name", placeholder: "Doe", required: true },
      { id: "3", type: "Text Field", label: "Phone", placeholder: "Phone", required: true },
      { id: "4", type: "Text Field", label: "Email", placeholder: "you@example.com", required: true },
    ])
  );

  const [isJsonView, setIsJsonView] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addField = (type) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: `New ${type}`,
      placeholder: "",
      required: false,
      options: ["Option 1", "Option 2"]
    };
    setFields([...fields, newField]);
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const duplicateField = (field) => {
    const newField = { ...field, id: Date.now().toString() };
    const index = fields.findIndex(f => f.id === field.id);
    const newFields = [...fields];
    newFields.splice(index + 1, 0, newField);
    setFields(newFields);
  };

  const moveField = (index, direction) => {
    if (direction === "up" && index > 0) {
      const newFields = [...fields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      setFields(newFields);
    } else if (direction === "down" && index < fields.length - 1) {
      const newFields = [...fields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      setFields(newFields);
    }
  };

  const saveEditedField = (updatedField) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
    setEditingField(null);
  };

  const handleSubmitForm = async () => {
    setIsSubmitting(true);
    try {
      await axios.post('/api/website-builder/forms', {
        name: activeForm.name,
        fields: fields
      }, { withCredentials: true });
      // In a real app, maybe show a success message
      setActiveForm(null); // Return to list
    } catch (error) {
      console.error("Error saving form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={itemVariants} className="builder-view-container" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <Title level={4} style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 800 }}>{activeForm?.name}</Title>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Click fields on the right to add them, reorder on the canvas, then save.</Text>
          </div>
          <Space size="large">
            <div style={{ background: 'var(--bg-secondary)', padding: '4px', borderRadius: 8, display: 'flex', gap: 4, border: '1px solid var(--border-color)' }}>
              <div
                onClick={() => setIsJsonView(false)}
                style={{ padding: '6px 16px', background: !isJsonView ? 'var(--accent-primary)' : 'transparent', color: !isJsonView ? '#fff' : 'var(--text-secondary)', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                Visual
              </div>
              <div
                onClick={() => setIsJsonView(true)}
                style={{ padding: '6px 16px', background: isJsonView ? 'var(--accent-primary)' : 'transparent', color: isJsonView ? '#fff' : 'var(--text-secondary)', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                JSON
              </div>
            </div>
          </Space>
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
          {/* Main Canvas */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
            <Card 
              bodyStyle={{ padding: "40px" }} 
              style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-md)' }} 
              className="builder-canvas"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const type = e.dataTransfer.getData('fieldType');
                if (type) addField(type);
              }}
            >

              {isJsonView ? (
                <pre style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', color: 'var(--text-primary)', overflowX: 'auto' }}>
                  {JSON.stringify(fields, null, 2)}
                </pre>
              ) : (
                fields.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    No fields added yet. Click an item on the right to add it.
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <div key={field.id} style={{ marginBottom: index === fields.length - 1 ? 0 : 24, padding: 16, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--bg-primary)', position: 'relative' }} className="builder-field-row">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {field.label} {field.required && <span style={{ color: "var(--accent-danger)" }}>*</span>} <HelpCircle size={14} color="var(--text-tertiary)" />
                        </div>
                        <div style={{ display: "flex", gap: 8, opacity: 0.6 }}>
                          <Edit3 size={16} style={{ cursor: 'pointer' }} onClick={() => setEditingField(field)} />
                          <Copy size={16} style={{ cursor: 'pointer' }} onClick={() => duplicateField(field)} />
                          <ArrowUp size={16} style={{ cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }} onClick={() => moveField(index, "up")} />
                          <ArrowDown size={16} style={{ cursor: index === fields.length - 1 ? 'not-allowed' : 'pointer', opacity: index === fields.length - 1 ? 0.3 : 1 }} onClick={() => moveField(index, "down")} />
                          <X size={16} style={{ cursor: 'pointer', color: 'var(--accent-danger)' }} onClick={() => removeField(field.id)} />
                        </div>
                      </div>
                      {(() => {
                        const commonProps = {
                          size: "large",
                          placeholder: field.placeholder || field.type,
                          style: { borderRadius: 8, width: '100%' },
                        };
                        switch (field.type.toLowerCase()) {
                          case "textarea":
                          case "text area":
                            return <Input.TextArea {...commonProps} rows={4} />;
                          case "select":
                            return (
                              <Select {...commonProps}>
                                {(field.options || []).map((opt, i) => <Option key={i} value={opt}>{opt}</Option>)}
                              </Select>
                            );
                          case "checkbox group":
                            return <Checkbox.Group options={field.options || []} />;
                          case "radio group":
                            return <Radio.Group options={field.options || []} />;
                          case "date field":
                          case "date":
                            return <DatePicker {...commonProps} />;
                          case "number":
                            return <Input type="number" {...commonProps} />;
                          case "email":
                            return <Input type="email" {...commonProps} />;
                          case "tel":
                            return <Input type="tel" {...commonProps} />;
                          case "time":
                            return <Input type="time" {...commonProps} />;
                          case "button":
                            return <Button type="primary" size="large" style={{ borderRadius: 8, height: 44, fontWeight: 700, padding: '0 32px' }}>{field.label || "Submit"}</Button>;
                          default:
                            return <Input {...commonProps} />;
                        }
                      })()}
                    </div>
                  ))
                )
              )}
            </Card>

            {/* Submit Button Area */}
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Button type="primary" block loading={isSubmitting} onClick={handleSubmitForm} style={{ height: 56, borderRadius: 12, backgroundColor: "var(--accent-success)", border: 'none', fontWeight: 800, fontSize: 16, boxShadow: 'var(--shadow-md)' }}>
                Save Form Template
              </Button>
              <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, display: 'flex', justifyContent: 'center', gap: 16 }}>
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
              </div>
            </div>

            <Button style={{ margin: "32px auto 0", display: "block", borderRadius: 8, height: 44, padding: '0 32px', fontWeight: 700, borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} onClick={() => setActiveForm(null)}>
              Back to Forms
            </Button>
          </div>

          {/* Right Sidebar Toolbox */}
          <div style={{ width: 280, flexShrink: 0, position: 'sticky', top: 24 }}>
            <Card bodyStyle={{ padding: "0" }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}><ListPlus size={18} /> Add Fields</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { type: "Autocomplete", icon: <Search size={16} /> },
                  { type: "Button", icon: <MousePointerClick size={16} /> },
                  { type: "Checkbox Group", icon: <CheckSquare size={16} /> },
                  { type: "Date Field", icon: <Calendar size={16} /> },
                  { type: "File Upload", icon: <Upload size={16} /> },
                  { type: "Header", icon: <Type size={16} /> },
                  { type: "Hidden Input", icon: <EyeOff size={16} /> },
                  { type: "Number", icon: <Hash size={16} /> },
                  { type: "Paragraph", icon: <AlignLeft size={16} /> },
                  { type: "Radio Group", icon: <List size={16} /> },
                  { type: "Select", icon: <ChevronDown size={16} /> },
                  { type: "Text Field", icon: <Type size={16} /> },
                  { type: "Text Area", icon: <Menu size={16} /> }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    padding: '16px 24px',
                    borderBottom: idx === 12 ? 'none' : '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'grab',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('fieldType', item.type);
                      e.target.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => {
                      e.target.style.opacity = '1';
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => addField(item.type)}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{item.icon}</span>
                    {item.type}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        title={<div style={{ fontSize: 20, fontWeight: 800, marginTop: 8, color: 'var(--text-primary)' }}>Edit Field</div>}
        open={!!editingField}
        onCancel={() => setEditingField(null)}
        footer={null}
        width={500}
        centered
        className="glassmorphism-modal"
      >
        {editingField && (
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Label</div>
              <Input size="large" value={editingField.label} onChange={(e) => setEditingField({ ...editingField, label: e.target.value })} style={{ borderRadius: 8 }} />
            </div>
            {editingField.type.toLowerCase() !== "button" && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Placeholder</div>
                  <Input size="large" value={editingField.placeholder} onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })} style={{ borderRadius: 8 }} />
                </div>
                <div style={{ marginBottom: 32 }}>
                  <Checkbox checked={editingField.required} onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Required Field</span>
                  </Checkbox>
                </div>
              </>
            )}
            
            {["select", "radio group", "checkbox group"].includes(editingField.type.toLowerCase()) && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Options (comma-separated)</div>
                <Input.TextArea rows={3} size="large" value={(editingField.options || []).join(', ')} onChange={(e) => setEditingField({ ...editingField, options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })} style={{ borderRadius: 8 }} placeholder="Option 1, Option 2, Option 3" />
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
              <Button style={{ borderRadius: 8, fontWeight: 700, height: 44, padding: "0 32px", borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} onClick={() => setEditingField(null)}>
                Cancel
              </Button>
              <Button type="primary" style={{ borderRadius: 8, fontWeight: 800, height: 44, padding: "0 32px", background: "var(--accent-primary)", border: 'none' }} onClick={() => saveEditedField(editingField)}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

const FormsTab = ({ itemVariants }) => {
  const [activeSubTab, setActiveSubTab] = useState("builder");
  const [activeForm, setActiveForm] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [createType, setCreateType] = useState("templates");
  const [formName, setFormName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleCreateContinue = () => {
    setIsCreateModalOpen(false);
    if (createType === "templates") {
      setIsTemplateModalOpen(true);
    } else {
      setActiveForm({ name: formName || "New Form", from: "scratch" });
    }
  };

  const renderHeader = () => {
    switch (activeSubTab) {
      case "builder":
        return { title: "Forms", subtitle: "Build reusable forms, embed them anywhere, and track submissions.", icon: <FileText size={24} color="var(--accent-primary)" /> };
      case "analyze":
        return { title: "Analyze", subtitle: "High-level submission volume across all forms.", icon: <BarChart3 size={24} color="var(--accent-info)" /> };
      case "submissions":
        return { title: "Submissions", subtitle: "Effortlessly review, manage, and export your form entries.", icon: <Inbox size={24} color="var(--accent-success)" /> };
      default:
        return { title: "", subtitle: "", icon: null };
    }
  };

  const headerInfo = renderHeader();

  const renderBuilderList = () => {
    const columns = [
      { title: "NAME", dataIndex: "name", key: "name", render: t => <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{t}</span> },
      { title: "STATUS", dataIndex: "status", key: "status", render: t => <Tag color="green" style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 700 }}>{t}</Tag> },
      { title: "UPDATED", dataIndex: "updated", key: "updated", render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
    ];

    return (
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <Space>
            <Input placeholder="Search forms..." prefix={<Search size={16} color="var(--text-tertiary)" />} size="large" style={{ width: 280, borderRadius: 8 }} />
          </Space>
        </div>
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <Table
            columns={columns}
            dataSource={[]}
            pagination={false}
            locale={{
              emptyText: (
                <div style={{ padding: "80px 0", textAlign: "center" }}>
                  <div style={{ width: 80, height: 80, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <FileText size={40} />
                  </div>
                  <Title level={4} style={{ marginBottom: 12, color: 'var(--text-primary)', fontWeight: 800 }}>No forms yet</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 15, fontWeight: 500 }}>
                    Click <strong style={{ color: "var(--text-primary)" }}>+ Create Form</strong> to pick a template or start from scratch.
                  </Text>
                  <Button type="primary" icon={<Plus size={18} />} onClick={() => setIsCreateModalOpen(true)} style={{ borderRadius: 8, height: 44, background: 'var(--accent-primary)', border: 'none', fontWeight: 700, padding: '0 32px' }}>Create Form</Button>
                </div>
              )
            }}
          />
        </Card>
      </motion.div>
    );
  };

  const renderAnalyze = () => {
    const columns = [
      { title: "FORM", dataIndex: "form", key: "form" },
      { title: "SUBMISSIONS", dataIndex: "submissions", key: "submissions" },
    ];

    return (
      <motion.div variants={itemVariants}>
        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col span={8}>
            <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 12, letterSpacing: 0.5 }}>ALL TIME</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1 }}>0</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>Submissions</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 12, letterSpacing: 0.5 }}>LAST 30 DAYS</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: 'var(--accent-info)', lineHeight: 1 }}>0</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>Submissions</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 12, letterSpacing: 0.5 }}>FORMS</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1 }}>0</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>In workspace</div>
            </Card>
          </Col>
        </Row>
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <Table
            columns={columns}
            dataSource={[]}
            pagination={false}
            locale={{ emptyText: <div style={{ padding: '40px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>No analytics data yet.</div> }}
          />
        </Card>
      </motion.div>
    );
  };

  const renderSubmissions = () => {
    const columns = [
      { title: "SUBMITTED AT", dataIndex: "submittedAt", key: "submittedAt" },
      { title: "FORM", dataIndex: "form", key: "form" },
      { title: "NAME", dataIndex: "name", key: "name" },
      { title: "EMAIL", dataIndex: "email", key: "email" },
      { title: "FIRST NAME", dataIndex: "firstName", key: "firstName" },
      { title: "PHONE", dataIndex: "phone", key: "phone" },
      { title: "DETAILS", dataIndex: "details", key: "details" },
    ];

    return (
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center', background: 'var(--bg-secondary)', padding: 24, borderRadius: 16, border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: 0.5 }}>FORM</div>
            <Space>
              <Select defaultValue="all" size="large" style={{ width: 180 }}>
                <Option value="all">All forms</Option>
              </Select>
              <Tag style={{ margin: 0, color: 'var(--accent-info)', background: 'rgba(14, 165, 233, 0.1)', border: 'none', padding: '6px 12px', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>0 submissions</Tag>
            </Space>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: 0.5 }}>FROM</div>
            <DatePicker size="large" placeholder="dd-mm-yyyy" format="DD-MM-YYYY" style={{ width: 150, borderRadius: 8 }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: 0.5 }}>TO</div>
            <DatePicker size="large" placeholder="dd-mm-yyyy" format="DD-MM-YYYY" style={{ width: 150, borderRadius: 8 }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: 0.5 }}>SEARCH</div>
            <Input size="large" placeholder="Search name, email, phone..." prefix={<Search size={16} color="var(--text-tertiary)" />} style={{ borderRadius: 8 }} />
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <Button type="primary" size="large" style={{ borderRadius: 8, fontWeight: 700, background: 'var(--accent-primary)', border: 'none', padding: '0 32px' }}>Filter</Button>
          </div>
        </div>
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <Table
            columns={columns}
            dataSource={[]}
            pagination={false}
            locale={{
              emptyText: (
                <div style={{ padding: "60px 0", color: "var(--text-secondary)", fontSize: "15px", fontWeight: 600 }}>
                  No submissions yet.
                </div>
              )
            }}
          />
        </Card>
      </motion.div>
    );
  };

  if (activeForm) {
    return <FormBuilderView activeForm={activeForm} setActiveForm={setActiveForm} itemVariants={itemVariants} />;
  }

  return (
    <motion.div variants={itemVariants}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            {headerInfo.icon} {headerInfo.title}
          </Title>
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>{headerInfo.subtitle}</Text>
        </div>
        {activeSubTab === "builder" && (
          <Space>
            <Button
              type="primary"
              icon={<Plus size={18} />}
              style={{ backgroundColor: "var(--accent-primary)", border: 'none', borderRadius: 8, fontWeight: 700, height: 44, padding: '0 24px', boxShadow: 'var(--shadow-md)' }}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Form
            </Button>
          </Space>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '2px solid var(--border-color)', paddingBottom: 0 }}>
        {[
          { key: "builder", label: "Builder", icon: <FileText size={16} /> },
          { key: "analyze", label: "Analyze", icon: <BarChart3 size={16} /> },
          { key: "submissions", label: "Submissions", icon: <Inbox size={16} /> }
        ].map(tab => (
          <div
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            style={{
              padding: '12px 16px',
              color: activeSubTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeSubTab === tab.key ? 800 : 600,
              fontSize: 14,
              cursor: 'pointer',
              borderBottom: activeSubTab === tab.key ? '3px solid var(--accent-primary)' : '3px solid transparent',
              marginBottom: -2,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
          </div>
        ))}
      </div>

      {activeSubTab === "builder" && renderBuilderList()}
      {activeSubTab === "analyze" && renderAnalyze()}
      {activeSubTab === "submissions" && renderSubmissions()}

      {/* CREATE NEW FORM MODAL */}
      <Modal
        title={<div style={{ fontSize: 20, fontWeight: 800, marginTop: 8, color: 'var(--text-primary)' }}>Create New Form</div>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={720}
        centered
        className="glassmorphism-modal"
      >
        <div style={{ marginTop: 24 }}>
          <Row gutter={24} style={{ marginBottom: 32 }}>
            <Col span={12}>
              <div
                onClick={() => setCreateType("scratch")}
                style={{
                  border: createType === "scratch" ? "2px solid var(--accent-primary)" : "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  borderRadius: 16,
                  padding: 24,
                  cursor: "pointer",
                  height: "100%",
                  transition: "all 0.2s",
                  boxShadow: createType === "scratch" ? "0 4px 20px rgba(59, 130, 246, 0.15)" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Start from Scratch</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4, fontWeight: 500 }}>Design from scratch using the form builder</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: createType === 'scratch' ? '6px solid var(--accent-primary)' : '2px solid var(--border-color)', flexShrink: 0 }} />
                </div>
                <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 64, height: 64, border: "2px dashed var(--border-color)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: 'var(--bg-primary)' }}>
                    <Plus size={24} color="var(--text-tertiary)" />
                  </div>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div
                onClick={() => setCreateType("templates")}
                style={{
                  border: createType === "templates" ? "2px solid var(--accent-primary)" : "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  borderRadius: 16,
                  padding: 24,
                  cursor: "pointer",
                  height: "100%",
                  transition: "all 0.2s",
                  boxShadow: createType === "templates" ? "0 4px 20px rgba(59, 130, 246, 0.15)" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>From templates</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4, fontWeight: 500 }}>Jump start with an awesome prebuilt form</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: createType === 'templates' ? '6px solid var(--accent-primary)' : '2px solid var(--border-color)', flexShrink: 0 }} />
                </div>
                <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "16px 24px", borderRadius: 12, border: "1px solid rgba(245, 158, 11, 0.2)", color: "var(--accent-warning)", fontWeight: 700, fontSize: 14 }}>
                    Browse our template library
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Form name <span style={{ color: "var(--accent-danger)" }}>*</span></div>
            <Input
              size="large"
              placeholder="e.g. Contact form, Workshop registration"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
            <Button style={{ borderRadius: 8, fontWeight: 700, height: 44, padding: "0 32px", borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" style={{ borderRadius: 8, fontWeight: 800, height: 44, padding: "0 32px", background: "var(--accent-primary)", border: 'none' }} onClick={handleCreateContinue} disabled={!formName && createType === 'scratch'}>
              Continue
            </Button>
          </div>
        </div>
      </Modal>

      {/* TEMPLATE LIBRARY MODAL */}
      <Modal
        title={null}
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
        footer={null}
        width={1100}
        centered
        bodyStyle={{ padding: 0, height: 750, display: "flex", flexDirection: "column", borderRadius: 16, overflow: 'hidden' }}
        className="glassmorphism-modal"
        closeIcon={<X size={20} color="var(--text-primary)" />}
      >
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }}>
          <Title level={4} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={20} color="var(--accent-primary)" /> Template Library
          </Title>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Sidebar */}
          <div style={{ width: 280, borderRight: "1px solid var(--border-color)", padding: "24px", overflowY: "auto", background: 'var(--bg-secondary)' }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 12, color: "var(--accent-primary)", fontWeight: 700, marginBottom: 32 }}>
              <Checkbox checked={true} />
              All Templates
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", marginBottom: 16, letterSpacing: 0.5 }}>BROWSE CATEGORIES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { name: "Automotive", count: 4 },
                { name: "Beauty & Fashion", count: 4 },
                { name: "Business Coaching", count: 4 },
                { name: "Creative", count: 4 },
                { name: "Financial", count: 4 },
                { name: "Fitness & Wellness", count: 4 },
                { name: "Food & Restaurant", count: 4 },
                { name: "Healthcare", count: 4 },
              ].map(cat => (
                <div key={cat.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-primary)", padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }} className="hover-bg-primary">
                  <Space>
                    <div style={{ width: 16, height: 16, border: "2px solid var(--border-color)", borderRadius: 4 }}></div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</span>
                  </Space>
                  <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 600 }}>{cat.count}</span>
                </div>
              ))}
              <div style={{ color: "var(--accent-primary)", fontWeight: 700, marginTop: 12, fontSize: 14, cursor: "pointer", padding: '0 12px' }}>Show more</div>
            </div>
          </div>

          {/* Right Content */}
          <div style={{ flex: 1, padding: "32px", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Forms</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>Showing 61 templates</div>
              </div>
              <Input size="large" placeholder="Search templates..." prefix={<Search size={16} color="var(--text-tertiary)" />} style={{ width: 300, borderRadius: 8 }} />
            </div>

            <div style={{ flex: 1, overflowY: "auto", margin: "-12px", padding: "12px" }}>
              <Row gutter={[24, 24]}>
                {formTemplates.map((tpl, i) => (
                  <Col span={8} key={tpl.id}>
                    <Card
                      onClick={() => setSelectedTemplate(tpl)}
                      bodyStyle={{ padding: 0 }}
                      style={{
                        borderRadius: 16,
                        overflow: "hidden",
                        border: selectedTemplate?.id === tpl.id ? "2px solid var(--accent-primary)" : "1px solid var(--border-color)",
                        cursor: "pointer",
                        background: 'var(--bg-secondary)',
                        transition: 'all 0.2s',
                        boxShadow: selectedTemplate?.id === tpl.id ? "0 4px 20px rgba(59, 130, 246, 0.15)" : "none"
                      }}
                      className="hover-shadow-md">
                      <div style={{ height: 200, background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ width: "100%", height: "100%", border: "1px solid var(--border-color)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12, background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
                          <div style={{ width: "60%", height: 8, background: "var(--text-tertiary)", borderRadius: 4, opacity: 0.5 }}></div>
                          <div style={{ width: "100%", height: 28, background: "var(--bg-primary)", borderRadius: 6, border: "1px solid var(--border-color)" }}></div>
                          <div style={{ width: "100%", height: 28, background: "var(--bg-primary)", borderRadius: 6, border: "1px solid var(--border-color)" }}></div>
                          <div style={{ width: "100%", height: 28, background: "var(--bg-primary)", borderRadius: 6, border: "1px solid var(--border-color)" }}></div>
                          <div style={{ width: "100%", height: 32, background: "var(--accent-primary)", borderRadius: 6, marginTop: "auto" }}></div>
                        </div>
                      </div>
                      <div style={{ padding: "20px" }}>
                        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tpl.templateName}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}>{tpl.category} · {tpl.fieldCount} fields</div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </div>

        {/* Template Footer */}
        <div style={{ padding: "24px 32px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)" }}>
          <div style={{ width: 400 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>Form name</div>
            <Input
              size="large"
              placeholder="Uses template name if empty"
              style={{ borderRadius: 8, borderColor: "var(--accent-primary)" }}
            />
          </div>
          <Space size="large">
            <Button size="large" style={{ borderRadius: 8, fontWeight: 700, padding: "0 32px", borderColor: 'var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} onClick={() => setIsTemplateModalOpen(false)}>
              Back
            </Button>
            <Button size="large" type="primary" disabled={!selectedTemplate} style={{ borderRadius: 8, fontWeight: 800, padding: "0 32px", background: "var(--accent-primary)", border: 'none' }} onClick={() => {
              setIsTemplateModalOpen(false);
              setActiveForm({
                name: formName || selectedTemplate?.templateName || "Template Form",
                from: "template",
                fields: selectedTemplate?.fields || []
              });
            }}>
              Use template
            </Button>
          </Space>
        </div>
      </Modal>
    </motion.div>
  );
};

export default FormsTab;
