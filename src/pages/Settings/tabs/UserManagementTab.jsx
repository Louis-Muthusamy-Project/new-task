import React, { useState } from 'react';
import { 
  Table, Button, Space, Tag, Input, Modal, Switch, 
  Card, Tabs, Typography, Form, Select, Checkbox, Row, Col, Popconfirm
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, 
  LoginOutlined, StopOutlined, CheckCircleOutlined, ApiOutlined, SafetyCertificateOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

// --- MOCK DATA ---
const initialUsers = [
  { _id: '1', name: 'Manimehalai', email: 'manimehalai.askeva@gmail.com', role: 'developer', companyName: 'Tunepath Technologies', isActive: true },
  { _id: '2', name: 'Naresh', email: 'nareshmurugadass71@gmail.com', role: 'developer', companyName: 'Tunepath Technologies', isActive: true },
  { _id: '3', name: 'Sujitha', email: 'sujithakabilan005@gmail.com', role: 'website_coordinator', companyName: 'Tunepath Technologies', isActive: true },
  { _id: '4', name: 'Jagandran', email: 'jagan.projectcoteam209@gmail.com', role: 'website_coordinator', companyName: 'Tunepath Technologies', isActive: true },
  { _id: '5', name: 'SAI KRISHNAN S', email: 'saikrishna.askeva@gmail.com', role: 'developer', companyName: 'Tunepath Technologies', isActive: true },
  { _id: '6', name: 'Suganthi', email: 'suganthi0623m@gmail.com', role: 'developer', companyName: 'Tunepath Technologies', isActive: false },
  { _id: '7', name: 'Amirtha', email: 'amirtha.askeva@gmail.com', role: 'developer', companyName: 'Tunepath Technologies', isActive: true },
];

const initialClients = [
  { _id: '101', name: 'Tunepath', email: 'tunepathmarketing@gmail.com', role: 'client', companyName: 'Tunepath', isActive: true, modules: { chatgpt: false, canva: false } },
  { _id: '102', name: 'ektahr', email: 'usha@ektahr.com', role: 'client', companyName: 'ektahr', isActive: true, modules: { chatgpt: false, canva: false } },
  { _id: '103', name: 'shoba textile', email: 'shobamanaparai@gmail.com', role: 'client', companyName: 'shoba textile', isActive: true, modules: { chatgpt: false, canva: false } },
  { _id: '104', name: 'bio world', email: 'info@bioworld.in', role: 'client', companyName: 'bio world', isActive: true, modules: { chatgpt: false, canva: false } },
  { _id: '105', name: 'Arumuga Traders', email: 'info@arumugatraders.com', role: 'client', companyName: 'Arumuga Traders', isActive: true, modules: { chatgpt: false, canva: false } },
];

const initialDepartments = [
  { _id: 'd1', name: 'General', slug: 'general', status: 'active' },
  { _id: 'd2', name: 'Web & Application Development', slug: 'web-application-development', status: 'active' },
  { _id: 'd3', name: 'BDE', slug: 'bde', status: 'active' },
  { _id: 'd4', name: 'SEO', slug: 'seo', status: 'active' },
  { _id: 'd5', name: 'Website Designing', slug: 'website-designing', status: 'active' },
  { _id: 'd6', name: 'Digital Marketing', slug: 'digital-marketing', status: 'active' },
];

const initialRoles = [
  { _id: 'r1', roleName: 'Super Admin', departmentId: 'd1', roleKey: 'super_admin', status: 'active' },
  { _id: 'r2', roleName: 'Admin', departmentId: 'd1', roleKey: 'admin', status: 'active' },
  { _id: 'r3', roleName: 'Developer', departmentId: 'd2', roleKey: 'developer', status: 'active' },
  { _id: 'r4', roleName: 'Website Coordinator', departmentId: 'd5', roleKey: 'website_coordinator', status: 'active' },
  { _id: 'r5', roleName: 'SEO Analyst', departmentId: 'd4', roleKey: 'seo', status: 'active' },
];

const getRoleColor = (role) => {
  const colors = {
    super_admin: 'red',
    admin: 'purple',
    coordinator: 'blue',
    website_coordinator: 'geekblue',
    bde: 'orange',
    seo: 'green',
    designer: 'magenta',
    developer: 'volcano',
    client: 'default'
  };
  return colors[role] || 'default';
};

const UserManagementTab = () => {
  const [activeTab, setActiveTab] = useState('user');
  
  // States for data
  const [users, setUsers] = useState(initialUsers);
  const [clients, setClients] = useState(initialClients);
  const [departments, setDepartments] = useState(initialDepartments);
  const [roles, setRoles] = useState(initialRoles);

  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  
  // Modals state
  const [userModal, setUserModal] = useState({ open: false, record: null });
  const [userForm] = Form.useForm();

  const [clientModuleModalOpen, setClientModuleModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientModuleValues, setClientModuleValues] = useState({ chatgpt: false, canva: false });

  const [deptModal, setDeptModal] = useState({ open: false, record: null });
  const [deptForm] = Form.useForm();

  const [roleModal, setRoleModal] = useState({ open: false, record: null });
  const [roleForm] = Form.useForm();
  
  const [permissionRoleId, setPermissionRoleId] = useState(null);
  const [draftPermissions, setDraftPermissions] = useState({});

  const permissionGroups = {
    'General': ['Command Center', 'Settings'],
    'Clients': ['Accounts', 'SLA & Success', 'Portal Settings'],
    'Workspace': [
      'Strategy', 
      'SEO / AEO / GEO', 
      'Content', 
      'AI Studio', 
      'Social Media', 
      'Performance Ads', 
      'CRM & Leads', 
      'Automation', 
      'Task Management'
    ]
  };

  // Handlers
  const handleToggleUserStatus = (record, isClient = false) => {
    if (isClient) {
      setClients(clients.map(c => c._id === record._id ? { ...c, isActive: !c.isActive } : c));
    } else {
      setUsers(users.map(u => u._id === record._id ? { ...u, isActive: !u.isActive } : u));
    }
  };

  const handleDeleteUser = (id, isClient = false) => {
    if (isClient) setClients(clients.filter(c => c._id !== id));
    else setUsers(users.filter(u => u._id !== id));
  };

  // User Columns
  const userColumns = [
    { title: <strong style={{color:'var(--text-secondary)'}}>NAME</strong>, dataIndex: 'name', key: 'name', render: t => <strong style={{color:'var(--text-primary)'}}>{t}</strong> },
    { title: <strong style={{color:'var(--text-secondary)'}}>EMAIL</strong>, dataIndex: 'email', key: 'email', render: t => <span style={{fontWeight:500}}>{t}</span> },
    { title: <strong style={{color:'var(--text-secondary)'}}>ROLE</strong>, dataIndex: 'role', key: 'role', render: role => (
        <Tag color={getRoleColor(role)} style={{ borderRadius: 6, fontWeight: 700, padding: '2px 8px' }}>
          {role.replace(/_/g, ' ').toUpperCase()}
        </Tag>
    )},
    { title: <strong style={{color:'var(--text-secondary)'}}>COMPANY</strong>, dataIndex: 'companyName', key: 'companyName', render: t => <span style={{fontWeight:500}}>{t}</span> },
    { title: <strong style={{color:'var(--text-secondary)'}}>STATUS</strong>, dataIndex: 'isActive', key: 'isActive', render: isActive => (
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 6, fontWeight: 700, padding: '2px 8px' }}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
    )},
    {
      title: <strong style={{color:'var(--text-secondary)'}}>ACTIONS</strong>, key: 'actions', align: 'right', fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} style={{ color: 'var(--accent-info)', fontWeight: 600 }}>View</Button>
          <Button type="text" icon={<LoginOutlined />} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Login as User</Button>
          <Button type="text" icon={<EditOutlined />} onClick={() => {
            setUserModal({ open: true, record });
            userForm.setFieldsValue({
              ...record,
              status: record.isActive ? 'active' : 'inactive'
            });
          }} style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>Edit</Button>
          <Popconfirm title="Delete this user?" onConfirm={() => handleDeleteUser(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} style={{ fontWeight: 600 }}>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Client Columns
  const clientColumns = [
    { title: <strong style={{color:'var(--text-secondary)'}}>NAME</strong>, dataIndex: 'name', key: 'name', render: t => <strong style={{color:'var(--text-primary)'}}>{t}</strong> },
    { title: <strong style={{color:'var(--text-secondary)'}}>EMAIL</strong>, dataIndex: 'email', key: 'email', render: t => <span style={{fontWeight:500}}>{t}</span> },
    { title: <strong style={{color:'var(--text-secondary)'}}>ROLE</strong>, dataIndex: 'role', key: 'role', render: role => (
        <Tag color="default" style={{ borderRadius: 6, fontWeight: 700, padding: '2px 8px' }}>CLIENT</Tag>
    )},
    { title: <strong style={{color:'var(--text-secondary)'}}>CLIENT</strong>, dataIndex: 'companyName', key: 'companyName', render: t => <span style={{fontWeight:500}}>{t}</span> },
    { title: <strong style={{color:'var(--text-secondary)'}}>STATUS</strong>, dataIndex: 'isActive', key: 'isActive', render: isActive => (
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 6, fontWeight: 700, padding: '2px 8px' }}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
    )},
    { title: <strong style={{color:'var(--text-secondary)'}}>MODULES</strong>, key: 'modules', render: (_, r) => (
        <Space size={[0, 8]} wrap>
          <Tag color={r.modules?.chatgpt ? "green" : "default"} style={{ borderRadius: 6, fontWeight: 600 }}>ChatGPT {r.modules?.chatgpt ? "On" : "Off"}</Tag>
          <Tag color={r.modules?.canva ? "blue" : "default"} style={{ borderRadius: 6, fontWeight: 600 }}>Canva {r.modules?.canva ? "On" : "Off"}</Tag>
        </Space>
    )},
    {
      title: <strong style={{color:'var(--text-secondary)'}}>ACTIONS</strong>, key: 'actions', align: 'right', fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} style={{ color: 'var(--accent-info)', fontWeight: 600 }}>View</Button>
          <Button type="text" icon={<LoginOutlined />} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Login as Client</Button>
          <Button type="text" icon={<ApiOutlined />} onClick={() => {
            setSelectedClient(record);
            setClientModuleValues(record.modules || {chatgpt: false, canva: false});
            setClientModuleModalOpen(true);
          }} style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>Modules</Button>
          <Button type="text" danger={record.isActive} icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />} onClick={() => handleToggleUserStatus(record, true)}>
            {record.isActive ? "Inactive" : "Active"}
          </Button>
        </Space>
      )
    }
  ];

  // Department Columns
  const deptColumns = [
    { title: <strong style={{color:'var(--text-secondary)'}}>DEPARTMENT</strong>, dataIndex: 'name', key: 'name', render: t => <strong style={{color:'var(--text-primary)'}}>{t}</strong> },
    { title: <strong style={{color:'var(--text-secondary)'}}>SLUG</strong>, dataIndex: 'slug', key: 'slug', render: t => <span style={{fontWeight:500}}>{t}</span> },
    { title: <strong style={{color:'var(--text-secondary)'}}>STATUS</strong>, dataIndex: 'status', key: 'status', render: status => (
        <Tag color={status === 'active' ? 'success' : 'error'} style={{ borderRadius: 6, fontWeight: 700, padding: '2px 8px' }}>
          {String(status).toUpperCase()}
        </Tag>
    )},
    {
      title: <strong style={{color:'var(--text-secondary)'}}>ACTIONS</strong>, key: 'actions', align: 'right', fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => {
            setDeptModal({ open: true, record });
            deptForm.setFieldsValue(record);
          }} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Edit</Button>
          <Popconfirm title="Delete this department?" onConfirm={() => setDepartments(departments.filter(d => d._id !== record._id))}>
            <Button type="text" danger icon={<DeleteOutlined />} style={{ fontWeight: 600 }}>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Role Columns
  const roleColumns = [
    { title: <strong style={{color:'var(--text-secondary)'}}>ROLE NAME</strong>, dataIndex: 'roleName', key: 'roleName', render: t => <strong style={{color:'var(--text-primary)'}}>{t}</strong> },
    { title: <strong style={{color:'var(--text-secondary)'}}>DEPARTMENT</strong>, key: 'department', render: (_, r) => (
        <span style={{fontWeight:500}}>{departments.find(d => d._id === r.departmentId)?.name || <Tag color="blue" style={{borderRadius: 6}}>System</Tag>}</span>
    )},
    { title: <strong style={{color:'var(--text-secondary)'}}>ROLE KEY</strong>, dataIndex: 'roleKey', key: 'roleKey', render: t => <span style={{fontWeight:500}}>{t}</span> },
    { title: <strong style={{color:'var(--text-secondary)'}}>STATUS</strong>, dataIndex: 'status', key: 'status', render: status => (
        <Tag color={status === 'active' ? 'success' : 'error'} style={{ borderRadius: 6, fontWeight: 700, padding: '2px 8px' }}>
          {String(status).toUpperCase()}
        </Tag>
    )},
    { title: <strong style={{color:'var(--text-secondary)'}}>ACCESS</strong>, key: 'access', render: (_, record) => (
        <Button type="text" icon={<SafetyCertificateOutlined />} onClick={() => setPermissionRoleId(record._id)} style={{ color: 'var(--accent-info)', fontWeight: 600 }}>Configure Permissions</Button>
    )},
    {
      title: <strong style={{color:'var(--text-secondary)'}}>ACTIONS</strong>, key: 'actions', align: 'right', fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => {
            setRoleModal({ open: true, record });
            roleForm.setFieldsValue(record);
          }} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Edit</Button>
          <Popconfirm title="Delete this role?" onConfirm={() => setRoles(roles.filter(r => r._id !== record._id))}>
            <Button type="text" danger icon={<DeleteOutlined />} style={{ fontWeight: 600 }}>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleDeptSubmit = () => {
    deptForm.validateFields().then(values => {
      if (deptModal.record) {
        setDepartments(departments.map(d => d._id === deptModal.record._id ? { ...d, ...values } : d));
      } else {
        setDepartments([...departments, { ...values, _id: Date.now().toString() }]);
      }
      setDeptModal({ open: false, record: null });
    });
  };

  const handleRoleSubmit = () => {
    roleForm.validateFields().then(values => {
      if (roleModal.record) {
        setRoles(roles.map(r => r._id === roleModal.record._id ? { ...r, ...values } : r));
      } else {
        setRoles([...roles, { ...values, _id: Date.now().toString() }]);
      }
      setRoleModal({ open: false, record: null });
    });
  };

  const handleUserSubmit = () => {
    userForm.validateFields().then(values => {
      if (userModal.record) {
        setUsers(users.map(u => u._id === userModal.record._id ? { ...u, ...values, isActive: values.status === 'active' } : u));
      } else {
        setUsers([...users, { ...values, _id: Date.now().toString(), isActive: values.status === 'active' }]);
      }
      setUserModal({ open: false, record: null });
    });
  };

  const handleSaveClientModules = () => {
    setClients(clients.map(c => c._id === selectedClient._id ? { ...c, modules: clientModuleValues } : c));
    setClientModuleModalOpen(false);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 900 }}>User Management</Title>
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>Manage users, clients, departments, and roles.</Text>
        </div>
        {activeTab === 'user' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setUserModal({ open: true, record: null }); userForm.resetFields(); userForm.setFieldsValue({ status: 'active', role: 'developer' }); }} style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: 8, fontWeight: 700, height: 40, padding: '0 24px' }}>
            Add User
          </Button>
        )}
      </div>

      <Card 
        className="glassmorphism" 
        bodyStyle={{ padding: 0 }} 
        style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          size="large"
          tabBarStyle={{ padding: '0 24px', margin: 0, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}
          items={[
            {
              key: 'user',
              label: <strong style={{ fontWeight: 600 }}>User</strong>,
              children: (
                <div>
                  <div style={{ padding: '24px 24px 0 24px' }}>
                    <Input 
                      placeholder="Search users by name or email..." 
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      prefix={<Search size={16} color="var(--text-tertiary)" />}
                      style={{ borderRadius: 10, maxWidth: 400, height: 44, fontWeight: 500 }}
                    />
                  </div>
                  <Table 
                    columns={userColumns} 
                    dataSource={filteredUsers} 
                    rowKey="_id" 
                    pagination={{ pageSize: 10 }} 
                    style={{ padding: 24 }}
                    rowClassName={() => 'hover-bg'}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              )
            },
            {
              key: 'client',
              label: <strong style={{ fontWeight: 600 }}>Client</strong>,
              children: (
                <div>
                  <div style={{ padding: '24px 24px 0 24px' }}>
                    <Input 
                      placeholder="Search client users by name or email..." 
                      value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)}
                      prefix={<Search size={16} color="var(--text-tertiary)" />}
                      style={{ borderRadius: 10, maxWidth: 400, height: 44, fontWeight: 500 }}
                    />
                  </div>
                  <Table 
                    columns={clientColumns} 
                    dataSource={filteredClients} 
                    rowKey="_id" 
                    pagination={{ pageSize: 10 }} 
                    style={{ padding: 24 }}
                    rowClassName={() => 'hover-bg'}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              )
            },
            {
              key: 'department',
              label: <strong style={{ fontWeight: 600 }}>Department</strong>,
              children: (
                <div>
                  <div style={{ padding: '24px 24px 0 24px', display: 'flex', justifyContent: 'space-between' }}>
                    <Input 
                      placeholder="Search departments..." 
                      prefix={<Search size={16} color="var(--text-tertiary)" />}
                      style={{ borderRadius: 10, maxWidth: 400, height: 44, fontWeight: 500 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setDeptModal({open: true, record: null}); deptForm.resetFields(); deptForm.setFieldsValue({ status: 'active' }); }} style={{ background: 'var(--accent-secondary)', border: 'none', borderRadius: 8, fontWeight: 700, height: 40, padding: '0 24px' }}>
                      Add Department
                    </Button>
                  </div>
                  <Table 
                    columns={deptColumns} 
                    dataSource={departments} 
                    rowKey="_id" 
                    pagination={{ pageSize: 10 }} 
                    style={{ padding: 24 }}
                    rowClassName={() => 'hover-bg'}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              )
            },
            {
              key: 'role',
              label: <strong style={{ fontWeight: 600 }}>Role</strong>,
              children: (
                <div>
                  <div style={{ padding: '24px 24px 0 24px', display: 'flex', justifyContent: 'space-between' }}>
                    <Input 
                      placeholder="Search roles..." 
                      prefix={<Search size={16} color="var(--text-tertiary)" />}
                      style={{ borderRadius: 10, maxWidth: 400, height: 44, fontWeight: 500 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setRoleModal({open: true, record: null}); roleForm.resetFields(); roleForm.setFieldsValue({ status: 'active' }); }} style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: 8, fontWeight: 700, height: 40, padding: '0 24px' }}>
                      Add Role
                    </Button>
                  </div>
                  <Table 
                    columns={roleColumns} 
                    dataSource={roles} 
                    rowKey="_id" 
                    pagination={{ pageSize: 10 }} 
                    style={{ padding: 24 }}
                    rowClassName={() => 'hover-bg'}
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Modals */}
      <Modal 
        title={<div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>{userModal.record ? 'Edit User' : 'Create User'}</div>}
        open={userModal.open} 
        onCancel={() => setUserModal({ open: false, record: null })} 
        onOk={handleUserSubmit}
        okButtonProps={{ style: { background: 'var(--accent-primary)', borderRadius: 8, fontWeight: 700, border: 'none' } }}
        cancelButtonProps={{ style: { borderRadius: 8, fontWeight: 600, background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' } }}
        className="glassmorphism-modal"
      >
        <Form form={userForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="name" label={<strong style={{ color: 'var(--text-secondary)' }}>Full Name</strong>} rules={[{ required: true }]}>
            <Input size="large" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </Form.Item>
          <Form.Item name="email" label={<strong style={{ color: 'var(--text-secondary)' }}>Email Address</strong>} rules={[{ required: true, type: 'email' }]}>
            <Input size="large" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </Form.Item>
          <Form.Item name="companyName" label={<strong style={{ color: 'var(--text-secondary)' }}>Company Name</strong>} rules={[{ required: true }]}>
            <Input size="large" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </Form.Item>
          <Form.Item name="role" label={<strong style={{ color: 'var(--text-secondary)' }}>Role</strong>} rules={[{ required: true }]}>
            <Select size="large">
              {roles.map(r => <Option key={r._id} value={r.roleKey}>{r.roleName}</Option>)}
              <Option value="client">Client</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label={<strong style={{ color: 'var(--text-secondary)' }}>Status</strong>} rules={[{ required: true }]}>
            <Select size="large">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal 
        title={<div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>{deptModal.record ? 'Edit Department' : 'Create Department'}</div>}
        open={deptModal.open} 
        onCancel={() => setDeptModal({ open: false, record: null })} 
        onOk={handleDeptSubmit}
        okButtonProps={{ style: { background: 'var(--accent-secondary)', borderRadius: 8, fontWeight: 700, border: 'none' } }}
        cancelButtonProps={{ style: { borderRadius: 8, fontWeight: 600, background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' } }}
        className="glassmorphism-modal"
      >
        <Form form={deptForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="name" label={<strong style={{ color: 'var(--text-secondary)' }}>Name</strong>} rules={[{ required: true }]}>
            <Input size="large" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </Form.Item>
          <Form.Item name="slug" label={<strong style={{ color: 'var(--text-secondary)' }}>Slug (optional)</strong>}>
            <Input size="large" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </Form.Item>
          <Form.Item name="status" label={<strong style={{ color: 'var(--text-secondary)' }}>Status</strong>} rules={[{ required: true }]}>
            <Select size="large">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal 
        title={<div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>{roleModal.record ? 'Edit Role' : 'Create Role'}</div>}
        open={roleModal.open} 
        onCancel={() => setRoleModal({ open: false, record: null })} 
        onOk={handleRoleSubmit}
        okButtonProps={{ style: { background: 'var(--accent-primary)', borderRadius: 8, fontWeight: 700, border: 'none' } }}
        cancelButtonProps={{ style: { borderRadius: 8, fontWeight: 600, background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' } }}
        className="glassmorphism-modal"
      >
        <Form form={roleForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="departmentId" label={<strong style={{ color: 'var(--text-secondary)' }}>Department</strong>} rules={[{ required: true }]}>
            <Select size="large">
              {departments.map(d => <Option key={d._id} value={d._id}>{d.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="roleName" label={<strong style={{ color: 'var(--text-secondary)' }}>Role Name</strong>} rules={[{ required: true }]}>
            <Input size="large" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </Form.Item>
          <Form.Item name="roleKey" label={<strong style={{ color: 'var(--text-secondary)' }}>Role Key (optional)</strong>}>
            <Input size="large" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </Form.Item>
          <Form.Item name="status" label={<strong style={{ color: 'var(--text-secondary)' }}>Status</strong>} rules={[{ required: true }]}>
            <Select size="large">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={clientModuleModalOpen}
        title={<div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Client Panel Modules - {selectedClient?.companyName}</div>}
        onCancel={() => setClientModuleModalOpen(false)}
        onOk={handleSaveClientModules}
        okText="Save Changes"
        className="glassmorphism-modal"
        okButtonProps={{ style: { background: 'var(--accent-info)', borderRadius: 8, fontWeight: 700, border: 'none' } }}
        cancelButtonProps={{ style: { borderRadius: 8, fontWeight: 600, background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' } }}
      >
        <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
            Control which client-only integrations are visible inside this client's panel. Disabled modules will stay hidden from the client panel UI.
          </Text>

          {["chatgpt", "canva"].map(moduleKey => (
            <div key={moduleKey} style={{ border: "1px solid var(--border-color)", background: 'var(--bg-tertiary)', borderRadius: 16, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: 'var(--shadow-sm)' }}>
              <div>
                <strong style={{ display: "block", marginBottom: 4, color: 'var(--text-primary)', fontSize: 15 }}>
                  {moduleKey === "chatgpt" ? "ChatGPT UI" : "Canva UI"}
                </strong>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  {moduleKey === "chatgpt" ? "Shows the AI chat workspace in the client panel." : "Shows the Canva workspace entry in the client panel."}
                </Text>
              </div>
              <Switch checked={clientModuleValues[moduleKey]} onChange={checked => setClientModuleValues(prev => ({ ...prev, [moduleKey]: checked }))} style={{ background: clientModuleValues[moduleKey] ? 'var(--accent-info)' : undefined }} />
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        title={<div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Module Permission Matrix <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>— {roles.find(r => r._id === permissionRoleId)?.roleName}</span></div>}
        width={900}
        open={!!permissionRoleId}
        onCancel={() => setPermissionRoleId(null)}
        footer={[
          <Button key="cancel" onClick={() => setPermissionRoleId(null)} style={{ borderRadius: 8, fontWeight: 600, background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} size="large">Cancel</Button>,
          <Button key="ok" onClick={() => setPermissionRoleId(null)} style={{ background: '#d9363e', borderColor: '#d9363e', borderRadius: 8, fontWeight: 700, padding: '0 32px' }} size="large" type="primary">OK</Button>
        ]}
        className="glassmorphism-modal"
        styles={{ body: { maxHeight: "70vh", overflowY: "auto", overflowX: "hidden" } }}
      >
        <Tabs 
          items={Object.entries(permissionGroups).map(([group, modules]) => ({
            key: group,
            label: <strong style={{ fontWeight: 600 }}>{group}</strong>,
            children: (
              <Table
                rowKey="module"
                dataSource={modules.map(m => ({ module: m }))}
                pagination={false}
                scroll={{ y: 400 }}
                rowClassName={() => 'hover-bg'}
                columns={[
                  { title: <strong style={{color:'var(--text-secondary)'}}>Module</strong>, dataIndex: 'module', key: 'module', render: t => <span style={{fontWeight:500}}>{t}</span> },
                  ...['Read', 'View', 'Create', 'Edit', 'Delete'].map(field => ({
                    title: <strong style={{color:'var(--text-secondary)'}}>{field}</strong>,
                    key: field,
                    align: 'center',
                    render: (_, record) => (
                      <Checkbox 
                        checked={!!draftPermissions[`${group}-${record.module}`]?.[field] || (record.module === 'Dashboard' && field === 'Read')}
                        disabled={record.module === 'Dashboard' && field === 'Read'}
                        onChange={(e) => setDraftPermissions(prev => ({
                          ...prev,
                          [`${group}-${record.module}`]: {
                            ...(prev[`${group}-${record.module}`] || {}),
                            [field]: e.target.checked
                          }
                        }))}
                      />
                    )
                  }))
                ]}
              />
            )
          }))}
          tabBarStyle={{ marginBottom: 16 }}
        />
      </Modal>
    </motion.div>
  );
};

export default UserManagementTab;
