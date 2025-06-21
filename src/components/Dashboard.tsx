import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useInvoices, Invoice } from '../hooks/useInvoices';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { InvoiceDetails } from './InvoiceDetails';
import { 
  Plus, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  Search, 
  Calendar, 
  DollarSign,
  Mail,
  Eye
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const { invoices, loading: invoicesLoading, createInvoice, sendInvoiceEmail } = useInvoices();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = (invoice.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalEarnings: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    pendingAmount: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
  };

  const handleCreateInvoice = async (invoiceData: any): Promise<string> => {
    try {
      const invoiceId = await createInvoice(invoiceData);
      setIsCreateModalOpen(false);
      return invoiceId;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      await sendInvoiceEmail(invoice.id);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (invoicesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-neutral-100">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-white/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-slate-800 to-zinc-900">
                Billr
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-zinc-700">Welcome, {currentUser?.displayName || currentUser?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">Dashboard</h2>
          <p className="text-zinc-600">Manage your invoices and track your earnings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-zinc-600 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-zinc-900">${stats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-zinc-700 to-slate-600">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-zinc-600 text-sm">Total Invoices</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.totalInvoices}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-zinc-600 text-sm">Paid Invoices</p>
                <p className="text-2xl font-bold text-zinc-900">{stats.paidInvoices}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-zinc-600 text-sm">Pending Amount</p>
                <p className="text-2xl font-bold text-zinc-900">${stats.pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-xl">
          <div className="p-6 border-b border-white/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-xl font-semibold text-zinc-900">Invoices</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/60 border border-white/40 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 bg-white/60 border border-white/40 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-zinc-900 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-zinc-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
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
                <tr className="border-b border-white/40">
                  <th className="text-left p-4 text-zinc-700 font-medium">Client</th>
                  <th className="text-left p-4 text-zinc-700 font-medium">Description</th>
                  <th className="text-left p-4 text-zinc-700 font-medium">Amount</th>
                  <th className="text-left p-4 text-zinc-700 font-medium">Status</th>
                  <th className="text-left p-4 text-zinc-700 font-medium">Due Date</th>
                  <th className="text-left p-4 text-zinc-700 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-white/20 hover:bg-white/20 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-zinc-900">{invoice.clientName || 'No name'}</div>
                        <div className="text-sm text-zinc-600">{invoice.clientEmail}</div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-800">{invoice.description}</td>
                    <td className="p-4 font-semibold text-zinc-900">${invoice.amount.toFixed(2)}</td>
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
                    <td className="p-4 text-zinc-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {invoice.dueDate.toDate().toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-white/40 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(invoice)}
                          className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-white/40 rounded-lg transition-all duration-200"
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
                <p className="text-zinc-600">No invoices found</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-zinc-900 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-zinc-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Create Your First Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {isCreateModalOpen && (
        <CreateInvoiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateInvoice={handleCreateInvoice}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}; 