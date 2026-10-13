import React, { useState, useEffect } from 'react';

export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];

  const getInitialUsers = () => [
    { id: 1, name: 'Admin User', email: 'admin@taskflow.com', role: 'Super Admin', pass: 'admin123' },
    { id: 2, name: 'QA Lead', email: 'qa@taskflow.com', role: 'QA Tester', pass: 'qa123' },
    { id: 3, name: 'Mark Chen', email: 'mark@taskflow.com', role: 'Product Manager', pass: 'pm123' },
    { id: 4, name: 'Emily Davis', email: 'emily@taskflow.com', role: 'UI Developer', pass: 'dev123' }
  ];

  const getInitialTasks = () => [
    { 
      id: 101, 
      key: 'TF-101', 
      title: 'Design authentication and SSO gateway', 
      type: 'Story', 
      status: 'In Progress', 
      assignee: 'Mark Chen', 
      priority: 'High', 
      severity: 'Critical',
      dueDate: todayStr, 
      project: 'Core Platform V2', 
      estHours: 12, 
      loggedHours: 6, 
      sprint: 'Sprint 24',
      comments: [{ id: 1, user: 'Admin User', text: 'Ensure OAuth2 token rotation is secured.' }], 
      subtasks: [{ id: 1, text: 'Wireframe OAuth screens', completed: true }, { id: 2, text: 'JWT validation middleware', completed: false }] 
    },
    { 
      id: 102, 
      key: 'TF-102', 
      title: 'Database connection timeout under heavy load', 
      type: 'Bug', 
      status: 'To Do', 
      assignee: 'Emily Davis', 
      priority: 'High', 
      severity: 'Blocker',
      dueDate: todayStr, 
      project: 'Core Platform V2', 
      estHours: 8, 
      loggedHours: 0, 
      sprint: 'Sprint 24',
      comments: [{ id: 2, user: 'QA Lead', text: 'Reproduced on staging cluster with 500 concurrent VUs.' }], 
      subtasks: [] 
    },
    { 
      id: 103, 
      key: 'TF-103', 
      title: 'Implement QA Defect Traceability Matrix', 
      type: 'Task', 
      status: 'In Review', 
      assignee: 'QA Lead', 
      priority: 'Medium', 
      severity: 'Major',
      dueDate: todayStr, 
      project: 'QA Automation', 
      estHours: 10, 
      loggedHours: 8, 
      sprint: 'Sprint 24',
      comments: [], 
      subtasks: [{ id: 1, text: 'Export mapping schema', completed: true }] 
    },
    { 
      id: 104, 
      key: 'TF-104', 
      title: 'Migrate legacy reporting REST endpoints to GraphQL', 
      type: 'Task', 
      status: 'Completed', 
      assignee: 'Admin User', 
      priority: 'Low', 
      severity: 'Minor',
      dueDate: todayStr, 
      project: 'Core Platform V2', 
      estHours: 16, 
      loggedHours: 16, 
      sprint: 'Sprint 23',
      comments: [], 
      subtasks: [] 
    }
  ];

  const getInitialProjects = () => [
    { id: 1, name: 'Core Platform V2', owner: 'Mark Chen', status: 'Active', targetDate: '2026-11-15' },
    { id: 2, name: 'QA Automation', owner: 'QA Lead', status: 'Active', targetDate: '2026-12-01' }
  ];

  // State
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('tf_users');
    return saved ? JSON.parse(saved) : getInitialUsers();
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('tf_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tf_tasks');
    return saved ? JSON.parse(saved) : getInitialTasks();
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('tf_projects');
    return saved ? JSON.parse(saved) : getInitialProjects();
  });

  const [dailyPlans, setDailyPlans] = useState(() => {
    const saved = localStorage.getItem('tf_daily_plans');
    return saved ? JSON.parse(saved) : { [todayStr]: [101] };
  });

  // Navigation & Modals
  const [currentView, setCurrentView] = useState('Board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);

  // Auth Form State
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('QA Tester');

  // Task Creation Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Task');
  const [newProject, setNewProject] = useState('Core Platform V2');
  const [newAssignee, setNewAssignee] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newSeverity, setNewSeverity] = useState('Major');
  const [newEstHours, setNewEstHours] = useState(8);
  const [newSprint, setNewSprint] = useState('Sprint 24');

  // Comment & Time logs
  const [newComment, setNewComment] = useState('');
  const [logHoursInput, setLogHoursInput] = useState('');

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [onlyMyItems, setOnlyMyItems] = useState(false);

  // Settings New User
  const [newMemName, setNewMemName] = useState('');
  const [newMemEmail, setNewMemEmail] = useState('');
  const [newMemRole, setNewMemRole] = useState('QA Tester');

  // AI Prompt
  const [aiPrompt, setAiPrompt] = useState('');

  const [newProjName, setNewProjName] = useState('');
  const [newProjOwner, setNewProjOwner] = useState('');

  const columns = [
    { name: 'To Do', color: '#64748b' },
    { name: 'In Progress', color: '#2563eb' },
    { name: 'In Review', color: '#d97706' },
    { name: 'Completed', color: '#059669' }
  ];

  useEffect(() => { localStorage.setItem('tf_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { if (currentUser) localStorage.setItem('tf_current_user', JSON.stringify(currentUser)); else localStorage.removeItem('tf_current_user'); }, [currentUser]);
  useEffect(() => { localStorage.setItem('tf_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('tf_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('tf_daily_plans', JSON.stringify(dailyPlans)); }, [dailyPlans]);

  // Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    const found = users.find(u => u.email.toLowerCase() === authEmail.trim().toLowerCase() && u.pass === authPass);
    if (found) { setCurrentUser(found); setAuthEmail(''); setAuthPass(''); }
    else alert('Invalid credentials! Try demo: admin@taskflow.com / admin123');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!authName || !authEmail || !authPass) return;
    const newUser = { id: Date.now(), name: authName.trim(), email: authEmail.trim().toLowerCase(), role: authRole, pass: authPass };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const handleLogout = () => setCurrentUser(null);

  const handleCreateUserInSettings = (e) => {
    e.preventDefault();
    if (!newMemName.trim() || !newMemEmail.trim()) return;
    const newUser = { id: Date.now(), name: newMemName.trim(), email: newMemEmail.trim().toLowerCase(), role: newMemRole, pass: '123456' };
    setUsers([...users, newUser]);
    setNewMemName(''); setNewMemEmail('');
    alert('Account created for ' + newUser.name + '! Default password: 123456');
  };

  const handleMoveStatus = (taskId, direction) => {
    const colNames = columns.map(c => c.name);
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const curIdx = colNames.indexOf(t.status);
        const newIdx = curIdx + direction;
        if (newIdx >= 0 && newIdx < colNames.length) return { ...t, status: colNames[newIdx] };
      }
      return t;
    }));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      key: 'TF-' + Math.floor(100 + Math.random() * 900),
      title: newTitle.trim(),
      type: newType,
      status: 'To Do',
      assignee: newAssignee || currentUser.name,
      priority: newPriority,
      severity: newSeverity,
      dueDate: todayStr,
      project: newProject,
      estHours: Number(newEstHours) || 8,
      loggedHours: 0,
      sprint: newSprint,
      comments: [],
      subtasks: []
    };
    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setIsModalOpen(false);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    setProjects([...projects, { id: Date.now(), name: newProjName.trim(), owner: newProjOwner.trim() || currentUser.name, status: 'Active', targetDate: todayStr }]);
    setNewProjName(''); setNewProjOwner('');
    setIsProjectModalOpen(false);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTaskForModal) return;
    const commentObj = { id: Date.now(), user: currentUser.name, text: newComment.trim() };
    const updated = tasks.map(t => {
      if (t.id === selectedTaskForModal.id) {
        const updatedTask = { ...t, comments: [...(t.comments || []), commentObj] };
        setSelectedTaskForModal(updatedTask);
        return updatedTask;
      }
      return t;
    });
    setTasks(updated);
    setNewComment('');
  };

  const handleLogHours = (e) => {
    e.preventDefault();
    const hrs = parseFloat(logHoursInput);
    if (isNaN(hrs) || hrs <= 0 || !selectedTaskForModal) return;
    const updated = tasks.map(t => {
      if (t.id === selectedTaskForModal.id) {
        const updatedTask = { ...t, loggedHours: (t.loggedHours || 0) + hrs };
        setSelectedTaskForModal(updatedTask);
        return updatedTask;
      }
      return t;
    });
    setTasks(updated);
    setLogHoursInput('');
  };

  const handleToggleSubtask = (taskId, subId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const updatedSubs = t.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
        const updatedTask = { ...t, subtasks: updatedSubs };
        if (selectedTaskForModal && selectedTaskForModal.id === taskId) setSelectedTaskForModal(updatedTask);
        return updatedTask;
      }
      return t;
    }));
  };

  const handleAiDraft = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const lower = aiPrompt.toLowerCase();
    let type = 'Task';
    if (lower.includes('bug') || lower.includes('error')) type = 'Bug';
    if (lower.includes('story') || lower.includes('feature')) type = 'Story';
    setNewTitle(aiPrompt.trim());
    setNewType(type);
    setAiPrompt('');
  };

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const completionPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19', fontFamily: 'Inter, system-ui, sans-serif', justifyContent: 'center', alignItems: 'center', padding: '20px', color: '#f8fafc' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', width: '420px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#2563eb', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '24px', marginBottom: '12px' }}>⚡</div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#fff' }}>Task Flow Enterprise</h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '6px 0 0 0' }}>Jira & Azure DevOps Inspired Suite</p>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#0f172a', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
            <button onClick={() => setAuthMode('login')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', backgroundColor: authMode === 'login' ? '#2563eb' : 'transparent', fontWeight: '700', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>Sign In</button>
            <button onClick={() => setAuthMode('register')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', backgroundColor: authMode === 'register' ? '#2563eb' : 'transparent', fontWeight: '700', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>Register</button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Email</label>
                <input type="email" placeholder="admin@taskflow.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Password</label>
                <input type="password" placeholder="••••••••" value={authPass} onChange={e => setAuthPass(e.target.value)} required style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '13px', outline: 'none' }} />
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Sign In</button>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #334155' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', margin: '0 0 10px 0', textTransform: 'uppercase' }}>⚡ Demo Access Profiles:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {users.map(u => (
                    <button key={u.id} type="button" onClick={() => setCurrentUser(u)} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '8px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', color: '#fff' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700' }}>{u.name}</div>
                      <div style={{ fontSize: '10px', color: '#38bdf8' }}>{u.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input type="text" placeholder="Sarah Jenkins" value={authName} onChange={e => setAuthName(e.target.value)} required style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Email</label>
                <input type="email" placeholder="sarah@taskflow.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Role</label>
                <select value={authRole} onChange={e => setAuthRole(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '13px', outline: 'none' }}>
                  <option value="QA Tester">QA Tester</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="UI Developer">UI Developer</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Password</label>
                <input type="password" placeholder="••••••••" value={authPass} onChange={e => setAuthPass(e.target.value)} required style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '13px', outline: 'none' }} />
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Register & Login</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19', fontFamily: 'Inter, system-ui, sans-serif', color: '#f8fafc' }}>
      
      {/* Enterprise Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#0f172a', padding: '24px 18px', borderRight: '1px solid #1e293b', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#2563eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>⚡</div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#fff' }}>Task Flow</h2>
              <span style={{ fontSize: '9px', fontWeight: '700', backgroundColor: '#0369a1', color: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>ENTERPRISE JIRA</span>
            </div>
          </div>

          <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', marginBottom: '10px', letterSpacing: '1px' }}>VIEWS & MODULES</p>
          {[
            { name: 'Board', label: 'Scrum Kanban Board', icon: '📌' },
            { name: 'Dashboard', label: 'Jira Executive Dashboard', icon: '📊' },
            { name: 'Backlog', label: 'Sprint Backlog', icon: '📋' },
            { name: 'Defects', label: 'QA Defect Tracker', icon: '🐛' },
            { name: 'Projects', label: 'Roadmap & Epics', icon: '📁' },
            { name: 'Settings', label: 'Team & Permissions', icon: '⚙️' }
          ].map(item => (
            <div 
              key={item.name} 
              onClick={() => setCurrentView(item.name)} 
              style={{ 
                padding: '10px 12px', 
                backgroundColor: currentView === item.name ? '#1e293b' : 'transparent', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                color: currentView === item.name ? '#38bdf8' : '#94a3b8', 
                fontSize: '13px', 
                fontWeight: currentView === item.name ? '700' : '500', 
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
              <span style={{ fontSize: '15px' }}>{item.icon}</span> {item.label}
            </div>
          ))}
        </div>

        {/* User Card */}
        <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
              {currentUser.name.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
              <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '600' }}>{currentUser.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', backgroundColor: '#450a0a', color: '#fca5a5', border: '1px solid #7f1d1d', padding: '5px', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>
            🚪 Logout Workspace
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div style={{ flex: 1, padding: '32px 36px', overflowX: 'auto', backgroundColor: '#0b0f19' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#fff' }}>{currentView === 'Board' ? 'Sprint 24 Scrum Board' : currentView}</h1>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>Role view active for <strong>{currentUser.name}</strong> ({currentUser.role})</p>
          </div>
          <button onClick={() => { setNewAssignee(currentUser.name); setIsModalOpen(true); }} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>+</span> Create Issue
          </button>
        </div>

        {/* 1. BOARD VIEW */}
        {currentView === 'Board' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: '#0f172a', padding: '12px 18px', borderRadius: '12px', border: '1px solid #1e293b', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="🔍 Search issue key or title..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px', outline: 'none' }}>
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button onClick={() => setOnlyMyItems(!onlyMyItems)} style={{ backgroundColor: onlyMyItems ? '#2563eb' : '#1e293b', color: onlyMyItems ? '#fff' : '#94a3b8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                👤 Assigned To Me
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', minWidth: '960px' }}>
              {columns.map((col, idx) => {
                const colTasks = tasks.filter(t => {
                  const matchesCol = t.status === col.name;
                  const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.key.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
                  const matchesMine = !onlyMyItems || t.assignee === currentUser.name;
                  return matchesCol && matchesSearch && matchesPriority && matchesMine;
                });

                return (
                  <div key={col.name} style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '14px', border: '1px solid #1e293b', minHeight: '560px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '2px solid ' + col.color }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }}></span>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#fff' }}>{col.name}</h3>
                      </div>
                      <span style={{ fontSize: '11px', backgroundColor: '#1e293b', color: col.color, padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                        {colTasks.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                      {colTasks.map(t => (
                        <div key={t.id} onClick={() => setSelectedTaskForModal(t)} style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', backgroundColor: '#0f172a', padding: '2px 6px', borderRadius: '4px' }}>
                              {t.key}
                            </span>
                            <span style={{ 
                              fontSize: '10px', 
                              fontWeight: '800', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              backgroundColor: t.type === 'Bug' ? '#450a0a' : t.type === 'Story' ? '#064e3b' : '#1e3a8a',
                              color: t.type === 'Bug' ? '#fca5a5' : t.type === 'Story' ? '#6ee7b7' : '#93c5fd'
                            }}>
                              {t.type}
                            </span>
                          </div>

                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', marginBottom: '10px', lineHeight: '1.4' }}>
                            {t.title}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '8px', marginTop: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '20px', height: '20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                                {t.assignee.charAt(0)}
                              </div>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.assignee}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                              {idx > 0 && (
                                <button onClick={() => handleMoveStatus(t.id, -1)} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#fff', cursor: 'pointer', padding: '2px 6px', fontSize: '11px' }}>⬅️</button>
                              )}
                              {idx < columns.length - 1 && (
                                <button onClick={() => handleMoveStatus(t.id, 1)} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#fff', cursor: 'pointer', padding: '2px 6px', fontSize: '11px' }}>➡️</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. JIRA EXECUTIVE DASHBOARD */}
        {currentView === 'Dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Sprint Completion</span>
              <h2 style={{ fontSize: '32px', margin: '8px 0 0 0', fontWeight: '800', color: '#10b981' }}>{completionPct}%</h2>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Open Bugs / Defects</span>
              <h2 style={{ fontSize: '32px', margin: '8px 0 0 0', fontWeight: '800', color: '#ef4444' }}>{tasks.filter(t => t.type === 'Bug' && t.status !== 'Completed').length}</h2>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Active Sprint Issues</span>
              <h2 style={{ fontSize: '32px', margin: '8px 0 0 0', fontWeight: '800', color: '#38bdf8' }}>{tasks.length}</h2>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Team Projects</span>
              <h2 style={{ fontSize: '32px', margin: '8px 0 0 0', fontWeight: '800' }}>{projects.length}</h2>
            </div>
          </div>
        )}

        {/* 3. SPRINT BACKLOG */}
        {currentView === 'Backlog' && (
          <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>Sprint 24 Backlog</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: '700', fontSize: '12px' }}>{t.key}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{t.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px', color: '#94a3b8' }}>
                    <span>👤 {t.assignee}</span>
                    <span style={{ backgroundColor: '#0f172a', padding: '2px 8px', borderRadius: '6px', color: '#fff' }}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. QA DEFECT TRACKER */}
        {currentView === 'Defects' && (
          <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>🐛 QA Defect Traceability & Bugs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.filter(t => t.type === 'Bug').map(bug => (
                <div key={bug.id} style={{ backgroundColor: '#1e293b', padding: '14px 18px', borderRadius: '8px', border: '1px solid #7f1d1d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ color: '#f87171', fontWeight: '800', fontSize: '12px' }}>{bug.key}</span>
                      <span style={{ backgroundColor: '#450a0a', color: '#fca5a5', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>SEVERITY: {bug.severity}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{bug.title}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Assignee: <strong>{bug.assignee}</strong> &bull; Status: <strong>{bug.status}</strong></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PROJECTS & EPICS */}
        {currentView === 'Projects' && (
          <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Company Epics & Roadmap 📁</h3>
              <button onClick={() => setIsProjectModalOpen(true)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>+ Create Project</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {projects.map(proj => (
                <div key={proj.id} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#fff' }}>{proj.name}</h4>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0' }}>Owner: <strong>{proj.owner}</strong> &bull; Target: {proj.targetDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SETTINGS */}
        {currentView === 'Settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>👥 Add Member Account</h3>
              <form onSubmit={handleCreateUserInSettings}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Member Name</label>
                  <input type="text" placeholder="John Dev" value={newMemName} onChange={e => setNewMemName(e.target.value)} required style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Email</label>
                  <input type="email" placeholder="john@taskflow.com" value={newMemEmail} onChange={e => setNewMemEmail(e.target.value)} required style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Role</label>
                  <select value={newMemRole} onChange={e => setNewMemRole(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }}>
                    <option value="QA Tester">QA Tester</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="UI Developer">UI Developer</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>+ Create Account</button>
              </form>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>📋 Team Accounts Directory ({users.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {users.map(u => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{u.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{u.email}</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#0f172a', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px' }}>{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ISSUE DETAIL MODAL */}
      {selectedTaskForModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '16px', width: '520px', border: '1px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', maxHeight: '85vh', overflowY: 'auto', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8', backgroundColor: '#1e293b', padding: '3px 8px', borderRadius: '6px' }}>{selectedTaskForModal.key}</span>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: '8px 0 0 0' }}>{selectedTaskForModal.title}</h2>
              </div>
              <button onClick={() => setSelectedTaskForModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '12px', color: '#94a3b8' }}>
              <div>Assignee: <strong>{selectedTaskForModal.assignee}</strong></div>
              <div>Priority: <strong style={{ color: selectedTaskForModal.priority === 'High' ? '#f87171' : '#38bdf8' }}>{selectedTaskForModal.priority}</strong></div>
              <div>Status: <strong>{selectedTaskForModal.status}</strong></div>
            </div>

            {/* Time Tracking */}
            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '10px', border: '1px solid #334155', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>⏱️ Time Spent: {selectedTaskForModal.loggedHours || 0}h / {selectedTaskForModal.estHours || 8}h Est.</div>
              <form onSubmit={handleLogHours} style={{ display: 'flex', gap: '8px' }}>
                <input type="number" placeholder="Hours..." value={logHoursInput} onChange={e => setLogHoursInput(e.target.value)} style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }} />
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Log Time</button>
              </form>
            </div>

            {/* Subtasks */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px' }}>Checklists & Subtasks</h4>
              {selectedTaskForModal.subtasks && selectedTaskForModal.subtasks.map(s => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: s.completed ? '#64748b' : '#cbd5e1', textDecoration: s.completed ? 'line-through' : 'none', cursor: 'pointer', margin: '4px 0' }}>
                  <input type="checkbox" checked={s.completed} onChange={() => handleToggleSubtask(selectedTaskForModal.id, s.id)} style={{ accentColor: '#2563eb' }} />
                  {s.text}
                </label>
              ))}
            </div>

            {/* Comments & Discussion */}
            <div style={{ borderTop: '1px solid #334155', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '12px' }}>💬 Comments & Discussion</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '140px', overflowY: 'auto' }}>
                {selectedTaskForModal.comments && selectedTaskForModal.comments.map(c => (
                  <div key={c.id} style={{ backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', marginBottom: '2px' }}>{c.user}</div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1' }}>{c.text}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Add a comment or bug note..." value={newComment} onChange={e => setNewComment(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px', outline: 'none' }} />
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Post</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ISSUE MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '16px', width: '440px', border: '1px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', color: '#f8fafc' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: '#fff' }}>Create New Issue</h3>
            
            <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155', marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', display: 'block', marginBottom: '6px' }}>✨ AI ISSUE ASSISTANT</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="e.g. Bug in login screen..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '13px', outline: 'none' }} />
                <button type="button" onClick={handleAiDraft} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Parse</button>
              </div>
            </div>

            <form onSubmit={handleAddTask}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Issue Title</label>
                <input type="text" placeholder="Summary of issue..." value={newTitle} onChange={e => setNewTitle(e.target.value)} required style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Issue Type</label>
                <select value={newType} onChange={e => setNewType(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }}>
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                  <option value="Story">Story</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Project</label>
                <select value={newProject} onChange={e => setNewProject(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }}>
                  {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Assignee</label>
                <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }}>
                  {users.map(u => <option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Priority</label>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Create Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isProjectModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#0f172a', padding: '32px', borderRadius: '16px', width: '400px', border: '1px solid #334155', color: '#f8fafc' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800' }}>Create Project / Epic</h3>
            <form onSubmit={handleAddProject}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Project Name</label>
                <input type="text" placeholder="Mobile App V3" value={newProjName} onChange={e => setNewProjName(e.target.value)} style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Owner</label>
                <input type="text" placeholder="Owner name..." value={newProjOwner} onChange={e => setNewProjOwner(e.target.value)} style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsProjectModalOpen(false)} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}