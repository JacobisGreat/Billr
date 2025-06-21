import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useInvoices, Invoice } from '../hooks/useInvoices';
import { useNavigate } from 'react-router-dom';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { InvoiceDetails } from './InvoiceDetails';
import { CustomerManagement } from './CustomerManagement';
import { ScheduleCalendar } from './ScheduleCalendar';
import { 
  Plus, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  Search, 
  Calendar, 
  DollarSign,
  Mail,
  Eye,
  Users,
  Repeat,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Edit3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

type DashboardTab = 'overview' | 'invoices' | 'customers' | 'schedule';

export const Dashboard: React.FC = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const { 
    invoices, 
    loading: invoicesLoading, 
    createInvoice, 
    editInvoice, 
    deleteInvoice,
    createCustomerFromInvoice,
    generateInvoiceFromTemplate,
    getTemplatesDueForGeneration,
    getRecurringTemplates,
    getInvoicesFromTemplate
  } = useInvoices();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [showMoreWidgets, setShowMoreWidgets] = useState(false);

  // Get filtered invoices (excluding templates from main view)
  const regularInvoices = invoices.filter(invoice => !invoice.isTemplate);
  const recurringTemplates = getRecurringTemplates();
  const templatesDue = getTemplatesDueForGeneration();

  const filteredInvoices = regularInvoices.filter(invoice => {
    const matchesSearch = (invoice.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalEarnings: regularInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    pendingAmount: regularInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
    totalInvoices: regularInvoices.length,
    paidInvoices: regularInvoices.filter(i => i.status === 'paid').length,
  };

  // Enhanced Analytics
  const currentDate = new Date();
  const currentMonth = startOfMonth(currentDate);
  const lastMonth = startOfMonth(subDays(currentDate, 30));
  const last30Days = subDays(currentDate, 30);
  const last7Days = subDays(currentDate, 7);

  const advancedStats = {
    thisMonthRevenue: regularInvoices.filter(inv => 
      inv.status === 'paid' && inv.createdAt.toDate() >= currentMonth
    ).reduce((sum, inv) => sum + inv.amount, 0),
    
    lastMonthRevenue: regularInvoices.filter(inv => 
      inv.status === 'paid' && 
      inv.createdAt.toDate() >= lastMonth && 
      inv.createdAt.toDate() < currentMonth
    ).reduce((sum, inv) => sum + inv.amount, 0),

    last30DaysRevenue: regularInvoices.filter(inv => 
      inv.status === 'paid' && inv.createdAt.toDate() >= last30Days
    ).reduce((sum, inv) => sum + inv.amount, 0),

    last7DaysRevenue: regularInvoices.filter(inv => 
      inv.status === 'paid' && inv.createdAt.toDate() >= last7Days
    ).reduce((sum, inv) => sum + inv.amount, 0),

    overdueInvoices: regularInvoices.filter(inv => inv.status === 'overdue').length,
    overdueAmount: regularInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),

    averageInvoiceValue: regularInvoices.length > 0 ? regularInvoices.reduce((sum, inv) => sum + inv.amount, 0) / regularInvoices.length : 0,
    conversionRate: regularInvoices.length > 0 ? (stats.paidInvoices / regularInvoices.length) * 100 : 0
  };

  const monthlyGrowth = advancedStats.lastMonthRevenue > 0 
    ? ((advancedStats.thisMonthRevenue - advancedStats.lastMonthRevenue) / advancedStats.lastMonthRevenue) * 100 
    : 0;

  // Revenue trend data (last 30 days)
  const revenueTrendData = eachDayOfInterval({
    start: last30Days,
    end: currentDate
  }).map(date => {
    const dayRevenue = regularInvoices
      .filter(inv => 
        inv.status === 'paid' && 
        format(inv.createdAt.toDate(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    return {
      date: format(date, 'MMM dd'),
      revenue: dayRevenue
    };
  });

  // Status breakdown for pie chart
  const statusBreakdown = [
    { name: 'Paid', value: stats.paidInvoices, color: '#10b981' },
    { name: 'Pending', value: regularInvoices.filter(inv => inv.status === 'pending').length, color: '#f59e0b' },
    { name: 'Overdue', value: advancedStats.overdueInvoices, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Monthly revenue data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subDays(currentDate, i * 30));
    const monthEnd = endOfMonth(monthStart);
    const monthRevenue = regularInvoices
      .filter(inv => 
        inv.status === 'paid' && 
        isWithinInterval(inv.createdAt.toDate(), { start: monthStart, end: monthEnd })
      )
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    return {
      month: format(monthStart, 'MMM'),
      revenue: monthRevenue,
      invoices: regularInvoices.filter(inv => 
        isWithinInterval(inv.createdAt.toDate(), { start: monthStart, end: monthEnd })
      ).length
    };
  }).reverse();

  const handleCreateInvoice = async (invoiceData: any): Promise<string> => {
    try {
      const invoiceId = await createInvoice(invoiceData);
      setIsCreateModalOpen(false);
      setEditingInvoice(null);
      return invoiceId;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  const handleEditInvoice = async (invoiceId: string, invoiceData: any): Promise<void> => {
    try {
      await editInvoice(invoiceId, invoiceData);
      setIsCreateModalOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error('Error editing invoice:', error);
      throw error;
    }
  };

  const handleOpenEditModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingInvoice(null);
  };

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      // Email functionality is currently disabled
      console.log('Email feature is disabled');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleCreateCustomer = async (invoiceData: any): Promise<string> => {
    try {
      const customerId = await createCustomerFromInvoice(invoiceData);
      return customerId;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };

  // Auto-generate invoices from due templates
  useEffect(() => {
    const generateDueInvoices = async () => {
      if (invoicesLoading) return;
      
      try {
        const dueTemplates = getTemplatesDueForGeneration();
        console.log('Templates due for generation:', dueTemplates.length);
        
        for (const template of dueTemplates) {
          try {
            console.log(`Generating invoice from template: ${template.templateName}`);
            await generateInvoiceFromTemplate(template.id);
          } catch (error) {
            console.error(`Failed to generate invoice from template ${template.templateName}:`, error);
          }
        }
      } catch (error) {
        console.error('Error checking for due templates:', error);
      }
    };

    // Run once when invoices are loaded
    if (!invoicesLoading && invoices.length > 0) {
      generateDueInvoices();
    }
  }, [invoicesLoading, invoices.length, getTemplatesDueForGeneration, generateInvoiceFromTemplate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <motion.div
            animate={{ 
              y: [0, -15, 0], 
              x: [0, 10, 0],
              scale: [1, 1.03, 1]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-24 left-24 w-40 h-40 bg-gradient-to-br from-brand-300/30 to-brand-400/20 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ 
              y: [0, 18, 0], 
              x: [0, -15, 0],
              scale: [1, 0.97, 1]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute bottom-24 right-24 w-56 h-56 bg-gradient-to-br from-brand-200/40 to-brand-300/30 rounded-full blur-3xl"
          />
        </div>

        <motion.div 
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative p-10 rounded-3xl bg-white/80 backdrop-blur-xl border border-brand-200/60 shadow-2xl max-w-sm mx-auto overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 2
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700">
                Billr
              </h1>
            </motion.div>
            
            <div className="relative mb-6 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-brand-200/30 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute w-12 h-12 border-4 border-transparent border-t-brand-600 border-r-brand-600 rounded-full"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute w-3 h-3 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full"
              />
            </div>
            
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-brand-700 font-medium"
            >
              Loading authentication...
            </motion.p>
            
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-300/60 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-300/60 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-300/60 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-300/60 rounded-br-3xl" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (invoicesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <motion.div
            animate={{ 
              y: [0, -12, 0], 
              x: [0, 8, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-28 left-28 w-44 h-44 bg-gradient-to-br from-brand-300/35 to-brand-400/25 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ 
              y: [0, 14, 0], 
              x: [0, -12, 0],
              scale: [1, 0.98, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-28 right-28 w-52 h-52 bg-gradient-to-br from-brand-200/45 to-brand-300/35 rounded-full blur-3xl"
          />
        </div>

        <motion.div 
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative p-10 rounded-3xl bg-white/80 backdrop-blur-xl border border-brand-200/60 shadow-2xl max-w-sm mx-auto overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 2
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700">
                Billr
              </h1>
            </motion.div>
            
            <div className="relative mb-6 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-brand-200/30 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute w-12 h-12 border-4 border-transparent border-t-brand-600 border-r-brand-600 rounded-full"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute w-3 h-3 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full"
              />
            </div>
            
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-brand-700 font-medium"
            >
              Loading your dashboard...
            </motion.p>
            
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-300/60 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-300/60 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-300/60 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-300/60 rounded-br-3xl" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-white/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-brand-700 to-brand-900 hover:from-brand-700 hover:via-brand-600 hover:to-brand-800 transition-all duration-300 cursor-pointer"
              >
                Billr
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-zinc-700">Welcome, {currentUser?.displayName || currentUser?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-medium shadow-brand hover:shadow-brand-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-300 flex items-center gap-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-brand-800 mb-2">Dashboard</h2>
          <p className="text-brand-600">Manage your invoices and track your earnings</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-brand-200/60">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'invoices', name: 'Invoices', icon: FileText },
                { id: 'customers', name: 'Customers', icon: Users },
                { id: 'schedule', name: 'Schedule', icon: Calendar }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as DashboardTab)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-brand-500 hover:text-brand-700 hover:border-brand-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-2 ${
                      isActive ? 'text-brand-600' : 'text-brand-400 group-hover:text-brand-500'
                    }`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-600 text-sm font-medium">Total Earnings</p>
                    <p className="text-2xl font-bold text-brand-800">${stats.totalEarnings.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      {monthlyGrowth >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ml-1 ${monthlyGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {Math.abs(monthlyGrowth).toFixed(1)}% vs last month
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-600 text-sm font-medium">This Month</p>
                    <p className="text-2xl font-bold text-brand-800">${advancedStats.thisMonthRevenue.toFixed(2)}</p>
                    <p className="text-xs text-brand-500 mt-1">
                      Last 30 days: ${advancedStats.last30DaysRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-600 text-sm font-medium">Pending Amount</p>
                    <p className="text-2xl font-bold text-brand-800">${stats.pendingAmount.toFixed(2)}</p>
                    <p className="text-xs text-brand-500 mt-1">
                      {regularInvoices.filter(inv => inv.status === 'pending').length} invoices
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brand-600 text-sm font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-brand-800">{advancedStats.conversionRate.toFixed(1)}%</p>
                    <p className="text-xs text-brand-500 mt-1">
                      {stats.paidInvoices}/{stats.totalInvoices} paid
                    </p>
                  </div>
                  <div className="p-3 bg-brand-100 rounded-xl">
                    <Target className="w-6 h-6 text-brand-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-brand-800">Revenue Trend (30 Days)</h3>
                  <div className="flex items-center gap-2 text-sm text-brand-600">
                    <div className="w-3 h-3 bg-brand-600 rounded-full"></div>
                    Daily Revenue
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b"
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          backdropFilter: 'blur(8px)'
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                      />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Status Breakdown Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
              >
                <h3 className="text-lg font-semibold text-brand-800 mb-6">Invoice Status Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          backdropFilter: 'blur(8px)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {statusBreakdown.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm text-brand-600">
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Show More Toggle */}
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setShowMoreWidgets(!showMoreWidgets)}
                className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-brand-200/60 rounded-xl text-brand-600 hover:text-brand-800 hover:bg-brand-50/80 transition-all duration-300 shadow-brand"
              >
                {showMoreWidgets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showMoreWidgets ? 'Show Less Analytics' : 'Show More Analytics'}
              </button>
            </div>

            {/* Extended Analytics (Show More) */}
            <AnimatePresence>
              {showMoreWidgets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6 mb-8"
                >
                  {/* Additional Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-600 text-sm font-medium">Average Invoice</p>
                          <p className="text-2xl font-bold text-brand-800">
                            ${advancedStats.averageInvoiceValue.toFixed(2)}
                          </p>
                          <p className="text-xs text-brand-500 mt-1">Per invoice</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-xl">
                          <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-600 text-sm font-medium">Last 7 Days</p>
                          <p className="text-2xl font-bold text-brand-800">
                            ${advancedStats.last7DaysRevenue.toFixed(2)}
                          </p>
                          <p className="text-xs text-brand-500 mt-1">This week</p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-xl">
                          <TrendingUp className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-600 text-sm font-medium">Overdue Amount</p>
                          <p className="text-2xl font-bold text-red-700">
                            ${advancedStats.overdueAmount.toFixed(2)}
                          </p>
                          <p className="text-xs text-red-500 mt-1">
                            {advancedStats.overdueInvoices} invoices
                          </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-xl">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-600 text-sm font-medium">Success Rate</p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {((stats.paidInvoices / Math.max(1, stats.totalInvoices)) * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">Paid invoices</p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-xl">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Monthly Trend Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand"
                  >
                    <h3 className="text-lg font-semibold text-brand-800 mb-6">Monthly Revenue Trends</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#64748b"
                            fontSize={12}
                            tick={{ fill: '#64748b' }}
                          />
                          <YAxis 
                            stroke="#64748b"
                            fontSize={12}
                            tick={{ fill: '#64748b' }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '8px',
                              backdropFilter: 'blur(8px)'
                            }}
                            formatter={(value: any, name: string) => [
                              name === 'revenue' ? `$${value.toFixed(2)}` : value,
                              name === 'revenue' ? 'Revenue' : 'Invoices'
                            ]}
                          />
                          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Invoices Table */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-xl">
              <div className="p-6 border-b border-white/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-xl font-semibold text-brand-800">Invoices</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/60 border border-white/40 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-4 py-2 pr-10 bg-white/60 border border-brand-200/60 rounded-xl text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm appearance-none bg-no-repeat bg-right"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.5em 1.5em'
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 flex items-center gap-2 shadow-brand hover:shadow-brand-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Create Invoice
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-200/40">
                      <th className="text-left p-4 text-brand-700 font-medium">Client</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Description</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Amount</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Status</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Due Date</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Type</th>
                      <th className="text-left p-4 text-brand-700 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-brand-200/20 hover:bg-brand-100/20 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-brand-800">{invoice.clientName || 'No name'}</div>
                            <div className="text-sm text-brand-600">{invoice.clientEmail}</div>
                          </div>
                        </td>
                        <td className="p-4 text-brand-700">{invoice.description}</td>
                        <td className="p-4 font-semibold text-brand-800">${invoice.amount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                            invoice.status === 'paid' 
                              ? 'bg-emerald-100/80 text-emerald-700'
                              : invoice.status === 'overdue'
                              ? 'bg-red-100/80 text-red-700'
                              : 'bg-amber-100/80 text-amber-700'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-brand-700">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {invoice.dueDate.toDate().toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          {invoice.isRecurring ? (
                            <div className="flex items-center gap-1 text-brand-600">
                              <Repeat className="w-4 h-4" />
                              <span className="text-xs">
                                {invoice.recurringFrequency ? `${invoice.recurringFrequency.charAt(0).toUpperCase() + invoice.recurringFrequency.slice(1)}` : 'Recurring'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-brand-500">One-time</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedInvoice(invoice)}
                              className="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(invoice)}
                              className="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                              title="Edit Invoice"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSendEmail(invoice)}
                              className="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredInvoices.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-brand-600">No invoices found</p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 shadow-brand hover:shadow-brand-lg"
                    >
                      Create Your First Invoice
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <CustomerManagement invoices={regularInvoices} />
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-xl">
            <div className="p-6 border-b border-white/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-xl font-semibold text-brand-800">All Invoices</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/60 border border-white/40 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-2 pr-10 bg-white/60 border border-brand-200/60 rounded-xl text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 flex items-center gap-2 shadow-brand hover:shadow-brand-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-200/40">
                    <th className="text-left p-4 text-brand-700 font-medium">Client</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Description</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Amount</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Status</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Due Date</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Type</th>
                    <th className="text-left p-4 text-brand-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-brand-200/20 hover:bg-brand-100/20 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-brand-800">{invoice.clientName || 'No name'}</div>
                          <div className="text-sm text-brand-600">{invoice.clientEmail}</div>
                        </div>
                      </td>
                      <td className="p-4 text-brand-700">{invoice.description}</td>
                      <td className="p-4 font-semibold text-brand-800">${invoice.amount.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                          invoice.status === 'paid' 
                            ? 'bg-emerald-100/80 text-emerald-700'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100/80 text-red-700'
                            : 'bg-amber-100/80 text-amber-700'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-brand-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {invoice.dueDate.toDate().toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        {invoice.isRecurring ? (
                          <div className="flex items-center gap-1 text-brand-600">
                            <Repeat className="w-4 h-4" />
                            <span className="text-xs">
                              {invoice.recurringFrequency ? `${invoice.recurringFrequency.charAt(0).toUpperCase() + invoice.recurringFrequency.slice(1)}` : 'Recurring'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-brand-500">One-time</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(invoice)}
                            className="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                            title="Edit Invoice"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendEmail(invoice)}
                            className="p-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {filteredInvoices.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-brand-600">No invoices found</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 shadow-brand hover:shadow-brand-lg"
                  >
                    Create Your First Invoice
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <ScheduleCalendar invoices={regularInvoices} />
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateInvoiceModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleCreateInvoice}
            editingInvoice={editingInvoice}
            onCreateCustomer={handleCreateCustomer}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedInvoice && (
          <InvoiceDetails
            invoice={selectedInvoice}
            isOpen={!!selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;