/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  MoreVertical, 
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock4,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Status = 'active' | 'inactive' | 'draft' | 'completed' | 'sent' | 'paid' | 'overdue';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'active' | 'inactive';
}

interface Project {
  id: string;
  title: string;
  clientId: string;
  status: 'draft' | 'active' | 'completed';
  deadline: string;
}

interface TimeLog {
  id: string;
  projectId: string;
  date: string;
  hours: number;
  description: string;
}

interface InvoiceItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  projectId: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  date: string;
}

// --- Mock Data ---

const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Sarah Jenkins', company: 'TechNova Solutions', email: 'sarah@technova.com', status: 'active' },
  { id: 'c2', name: 'Michael Chen', company: 'Chen & Co Designs', email: 'michael@chendesigns.io', status: 'active' },
  { id: 'c3', name: 'Elena Rodriguez', company: 'Global Logistics', email: 'elena@globallog.net', status: 'inactive' },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', title: 'Website Redesign', clientId: 'c1', status: 'active', deadline: '2024-05-15' },
  { id: 'p2', title: 'Brand Identity', clientId: 'c2', status: 'draft', deadline: '2024-06-01' },
  { id: 'p3', title: 'Mobile App UI', clientId: 'c1', status: 'completed', deadline: '2024-04-10' },
];

const INITIAL_TIME_LOGS: TimeLog[] = [
  { id: 't1', projectId: 'p1', date: '2024-04-20', hours: 4, description: 'Initial wireframes and discovery' },
  { id: 't2', projectId: 'p1', date: '2024-04-21', hours: 6, description: 'Homepage design iterations' },
  { id: 't3', projectId: 'p3', date: '2024-04-15', hours: 8, description: 'Final UI assets export' },
];

const INITIAL_INVOICES: Invoice[] = [
  { 
    id: 'inv-1001', 
    projectId: 'p3', 
    items: [{ description: 'Mobile App UI Design', hours: 25, rate: 80, amount: 2000 }],
    subtotal: 2000,
    taxRate: 10,
    taxAmount: 200,
    total: 2200,
    status: 'paid',
    date: '2024-04-12'
  },
  { 
    id: 'inv-1002', 
    projectId: 'p1', 
    items: [{ description: 'Website Redesign Phase 1', hours: 10, rate: 80, amount: 800 }],
    subtotal: 800,
    taxRate: 10,
    taxAmount: 80,
    total: 880,
    status: 'sent',
    date: '2024-04-22'
  }
];

// --- Components ---

const StatusBadge = ({ status }: { status: Status }) => {
  const styles: Record<Status, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    draft: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    sent: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    overdue: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Card = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

const EmptyState = ({ message, icon: Icon }: { message: string, icon: any }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-slate-500 font-medium">{message}</p>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(INITIAL_TIME_LOGS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  // Forms
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTime, setShowAddTime] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const activeClients = clients.filter(c => c.status === 'active').length;
    const openProjects = projects.filter(p => p.status !== 'completed').length;
    const unpaidTotal = invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    // Hours this week (simplified)
    const hoursThisWeek = timeLogs.reduce((sum, log) => sum + log.hours, 0);

    return { activeClients, openProjects, unpaidTotal, hoursThisWeek };
  }, [clients, projects, invoices, timeLogs]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'timelog', label: 'Time Log', icon: Clock },
    { id: 'invoices', label: 'Invoices', icon: FileText },
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Open Projects', value: stats.openProjects, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Unpaid Invoices', value: `$${stats.unpaidTotal.toLocaleString()}`, icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Hours This Week', value: stats.hoursThisWeek, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</button>
          </div>
          <div className="space-y-6">
            {timeLogs.slice(0, 5).map((log, i) => {
              const project = projects.find(p => p.id === log.projectId);
              return (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center">
                      <Clock4 className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">
                      Logged <span className="font-semibold">{log.hours} hours</span> for <span className="font-semibold">{project?.title}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{log.date} • {log.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {projects.filter(p => p.status !== 'completed').map((project, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                  <p className="text-xs text-slate-500">{project.deadline}</p>
                </div>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const updateProjectStatus = (id: string, newStatus: Project['status']) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const updateClientStatus = (id: string, newStatus: Client['status']) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Clients</h2>
        <button 
          onClick={() => setShowAddClient(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length > 0 ? clients.map((client) => (
          <Card key={client.id} className="p-6 hover:border-indigo-200 transition-colors group cursor-pointer relative">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-lg">
                {client.name.charAt(0)}
              </div>
              <select 
                value={client.status}
                onChange={(e) => updateClientStatus(client.id, e.target.value as any)}
                className="text-xs font-medium px-2 py-1 rounded-full border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{client.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{client.company}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FileText className="w-3 h-3" />
              {projects.filter(p => p.clientId === client.id).length} Projects
            </div>
          </Card>
        )) : (
          <div className="col-span-full">
            <EmptyState message="No clients found. Add your first client to get started." icon={Users} />
          </div>
        )}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
        <button 
          onClick={() => setShowAddProject(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="space-y-4">
        {projects.length > 0 ? projects.map((project) => {
          const client = clients.find(c => c.id === project.clientId);
          return (
            <Card key={project.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{project.title}</h3>
                  <p className="text-xs text-slate-500">{client?.company || 'Unknown Client'}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Deadline</p>
                  <p className="text-sm font-medium text-slate-700">{project.deadline}</p>
                </div>
                <select 
                  value={project.status}
                  onChange={(e) => updateProjectStatus(project.id, e.target.value as any)}
                  className="text-xs font-medium px-2 py-1 rounded-full border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        }) : (
          <EmptyState message="No projects yet. Create a project to start tracking time." icon={Briefcase} />
        )}
      </div>
    </div>
  );

  const renderTimeLog = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Time Log</h2>
        <button 
          onClick={() => setShowAddTime(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Time
        </button>
      </div>

      <Card className="p-6 bg-indigo-600 text-white border-none">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium mb-1">Total Hours Logged</p>
            <p className="text-4xl font-bold">{timeLogs.reduce((s, l) => s + l.hours, 0)}h</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-100 text-sm font-medium mb-1">This Week</p>
            <p className="text-2xl font-bold">{stats.hoursThisWeek}h</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {timeLogs.length > 0 ? timeLogs.map((log) => {
          const project = projects.find(p => p.id === log.projectId);
          return (
            <Card key={log.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <p className="text-xs text-slate-400 uppercase font-bold">{new Date(log.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                  <p className="text-lg font-bold text-slate-900">{new Date(log.date).getDate()}</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <h3 className="font-bold text-slate-900">{project?.title}</h3>
                  <p className="text-sm text-slate-500">{log.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-bold text-slate-700">
                  {log.hours}h
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        }) : (
          <EmptyState message="No time logs yet. Start tracking your work!" icon={Clock} />
        )}
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      <div className="space-y-4">
        {invoices.length > 0 ? invoices.map((invoice) => {
          const project = projects.find(p => p.id === invoice.projectId);
          const client = clients.find(c => c.id === project?.clientId);
          return (
            <Card key={invoice.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">#{invoice.id}</h3>
                  <p className="text-xs text-slate-500">{client?.company} • {project?.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Amount</p>
                  <p className="text-sm font-bold text-slate-900">${invoice.total.toLocaleString()}</p>
                </div>
                <StatusBadge status={invoice.status} />
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        }) : (
          <EmptyState message="No invoices found. Bill your clients for completed work." icon={FileText} />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">FreelanceFlow</h1>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                VS
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">vidalstephen@gmail.com</p>
                <p className="text-xs text-slate-500">Pro Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 relative">
              <div className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2 border-2 border-white" />
              <Clock className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <span className="text-sm font-semibold hidden sm:block">Stephen</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'clients' && renderClients()}
              {activeTab === 'projects' && renderProjects()}
              {activeTab === 'timelog' && renderTimeLog()}
              {activeTab === 'invoices' && renderInvoices()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals (Simplified) */}
      {showAddClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add New Client</h3>
              <button onClick={() => setShowAddClient(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddClient(false); }}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company</label>
                <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Acme Inc" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input type="email" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="john@example.com" />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Create Client</button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
