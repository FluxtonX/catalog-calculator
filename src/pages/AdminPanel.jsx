import React, { useState, useEffect } from 'react';
import { UserPlus, RefreshCw, Users, Mail, Shield, Search, Sparkles, Settings, FileText, Save, Database, Globe } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import UserCard from '../components/ui/UserCard';
import { supabase } from '../utils/supabase';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('admin_active_tab') || 'settings';
  });

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);
  
  // User Management State
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // All authenticated users
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Settings State
  const [multiples, setMultiples] = useState({
    conservative: 6,
    market: 8,
    premium: 10,
    accelerator: 1.30
  });

  // Reports State
  const [allReports, setAllReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
    // Load settings from local storage
    setMultiples({
      conservative: parseFloat(localStorage.getItem('admin_settings_conservative_multiple')) || 6,
      market: parseFloat(localStorage.getItem('admin_settings_market_multiple')) || 8,
      premium: parseFloat(localStorage.getItem('admin_settings_premium_multiple')) || 10,
      accelerator: parseFloat(localStorage.getItem('admin_settings_accelerator_multiple')) || 1.30,
    });
  }, []);

  const fetchAllReports = async () => {
    setIsLoadingReports(true);
    try {
      // Fetch all reports to audit
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setAllReports(data || []);
    } catch (err) {
      console.error('Failed to fetch global reports', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchAllReports();
      if (allUsers.length === 0) fetchUsers(); // Need users list to cross-reference names
    } else if (activeTab === 'users' || activeTab === 'public_users') {
      fetchUsers();
    }
  }, [activeTab]);

  const [invitedEmails, setInvitedEmails] = useState([]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // 1. Fetch all profiles (try secure RPC first to get auth.users dates)
      let profilesData = [];
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_users_admin');
      
      if (!rpcError && rpcData) {
        profilesData = rpcData;
      } else {
        // Fallback if SQL hasn't been run yet
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('*');
        if (fallbackError) throw fallbackError;
        profilesData = fallbackData || [];
      }
      
      // 2. Fetch invitations to know who was explicitly invited
      const { data: invitesData, error: invitesError } = await supabase
        .from('invitations')
        .select('email');
        
      if (invitesError && invitesError.code !== '42P01') { 
        // Ignore 42P01 (table doesn't exist yet) to not crash before they run the SQL
        console.error('Invites fetch error:', invitesError);
      }
      
      const invitedList = (invitesData || []).map(i => i.email.toLowerCase());
      setInvitedEmails(invitedList);
      
      // Filter out random public users! Only show admins OR explicitly invited people
      const filtered = (profilesData || []).filter(u => 
        u.role === 'admin' || (u.email && invitedList.includes(u.email.toLowerCase()))
      );
      
      setUsers(filtered);
      setAllUsers(profilesData || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('admin_settings_conservative_multiple', multiples.conservative);
    localStorage.setItem('admin_settings_market_multiple', multiples.market);
    localStorage.setItem('admin_settings_premium_multiple', multiples.premium);
    localStorage.setItem('admin_settings_accelerator_multiple', multiples.accelerator);
    alert('Valuation settings saved globally! The application will now reload to apply changes.');
    window.location.reload();
  };

  const handleInvite = async () => {
    if (!email) return;
    try {
      // 1. Record the invitation in the database so we know to show them in the list!
      const { error: inviteError } = await supabase
        .from('invitations')
        .upsert({ email: email.toLowerCase(), role: selectedRole });
        
      if (inviteError) throw inviteError;

      // 2. Send the actual magic link
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`, 
        }
      });
      
      if (error) throw error;
      
      alert(`Magic link invitation sent to ${email}! They will now appear in your active users list when they sign in.`);
      setEmail('');
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Invite error:", err);
      alert(`Error inviting user: ${err.message}`);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Role update error:", err);
      alert(`Error updating role: ${err.message}\n(Make sure you have an RLS policy that allows Admins to update profiles!)`);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Are you sure you want to ban this user? They will lose access to the system.")) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'banned' }) // or you could delete the row entirely
        .eq('id', userId);
        
      if (error) throw error;
      
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error("Remove user error:", err);
      alert(`Error removing user: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.role !== 'banned') && // Hide banned users
    ((user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/20 dark:to-blue-500/20 rounded-full border border-emerald-500/20">
            <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Admin Dashboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
            System Administration
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Manage valuation logic, audit generated reports, and invite team members.
          </p>
        </div>

        {/* Custom Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Settings size={18} /> Valuation Logic
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <FileText size={18} /> Audit Reports
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Users size={18} /> Manage Team
          </button>
          <button
            onClick={() => setActiveTab('public_users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === 'public_users'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Globe size={18} /> All Users
          </button>
        </div>

        {/* =======================
            TAB 1: VALUATION SETTINGS 
            ======================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-800/30 shadow-xl overflow-hidden">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 border-b border-emerald-100 dark:border-emerald-800/30 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="text-emerald-500" />
                    Global Valuation Multipliers
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Adjust the core financial multipliers used by the Valuation Engine across all platforms.
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  <Save size={18} /> Save & Apply
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Conservative (Low)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={multiples.conservative}
                    onChange={e => setMultiples({...multiples, conservative: e.target.value})}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Default: 6x</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Market (Mid)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={multiples.market}
                    onChange={e => setMultiples({...multiples, market: e.target.value})}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Default: 8x</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Premium (High)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={multiples.premium}
                    onChange={e => setMultiples({...multiples, premium: e.target.value})}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Default: 10x</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Accelerator Premium</label>
                  <input
                    type="number"
                    step="0.05"
                    value={multiples.accelerator}
                    onChange={e => setMultiples({...multiples, accelerator: e.target.value})}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">Default: 1.30 (30%)</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* =======================
            TAB 2: AUDIT REPORTS 
            ======================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800/30 shadow-xl overflow-hidden">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 border-b border-blue-100 dark:border-blue-800/30 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="text-blue-500" />
                      System-Wide Valuation Reports
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Audit all reports generated across the application by any user.
                    </p>
                  </div>
                  <button onClick={fetchAllReports} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                    <RefreshCw size={20} className={isLoadingReports ? "animate-spin" : ""} />
                  </button>
                </div>
                
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                        <th className="p-4">Artist</th>
                        <th className="p-4">Report Type</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4">Generated By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                      {allReports.length === 0 ? (
                         <tr>
                           <td colSpan={4} className="p-8 text-center text-slate-500">
                              {isLoadingReports ? "Loading reports..." : "No reports found in the system yet."}
                           </td>
                         </tr>
                      ) : (
                        allReports.map(report => (
                          <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-semibold text-slate-900 dark:text-white">{report.artist_name}</td>
                            <td className="p-4">
                               <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                 report.report_type === 'custom_valuation' ? 'bg-emerald-100 text-emerald-700' :
                                 report.report_type === 'itunes_valuation' ? 'bg-slate-200 text-slate-800' :
                                 report.report_type === 'youtube_valuation' ? 'bg-red-100 text-[#FF0000]' :
                                 'bg-blue-100 text-blue-700'
                               }`}>
                                 {report.report_type || 'spotify_valuation'}
                               </span>
                            </td>
                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                              {new Date(report.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400" title={report.user_id}>
                              {currentUser && currentUser.id === report.user_id ? (
                                <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                  You <span className="text-xs text-slate-500 font-normal">({currentUser.email})</span>
                                </span>
                              ) : (
                                (() => {
                                  // Find the user in our globally fetched allUsers array
                                  const matchingUser = allUsers.find(u => u.id === report.user_id);
                                  const displayName = matchingUser?.full_name || (matchingUser?.email ? matchingUser.email.split('@')[0] : `User ${report.user_id?.substring(0, 5)}`);
                                  const fullEmail = matchingUser?.email || '';
                                  
                                  return (
                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                      {displayName} {fullEmail && <span className="text-xs text-slate-500 font-normal">({fullEmail})</span>}
                                    </span>
                                  );
                                })()
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
             </Card>
          </div>
        )}

        {/* =======================
            TAB 3: USER MANAGEMENT
            ======================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Invite New User Card */}
            <Card className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800/30 shadow-xl overflow-hidden">
              <div className="bg-purple-50 dark:bg-purple-900/10 p-6 border-b border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
                    <UserPlus size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Invite New User
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Send an invitation to add new team members
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-6 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="lg:col-span-3 relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none cursor-pointer shadow-sm font-semibold"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="lg:col-span-3">
                    <Button 
                      icon={UserPlus}
                      onClick={handleInvite}
                      disabled={!email}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg py-3 font-bold"
                    >
                      Send Invite
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Users List Card */}
            <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="text-slate-500" size={20} /> Active Users
                    </h2>
                  </div>
                  
                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
                
                {filteredUsers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        name={user.full_name || 'Unnamed User'}
                        email={user.email}
                        role={user.role || 'user'}
                        onRoleChange={(newRole) => handleRoleChange(user.id, newRole)}
                        onRemove={() => handleRemove(user.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No users found.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* =======================
            TAB 4: ALL PUBLIC USERS
            ======================= */}
        {activeTab === 'public_users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-800/30 shadow-xl overflow-hidden">
                <div className="bg-amber-50 dark:bg-amber-900/10 p-6 border-b border-amber-100 dark:border-amber-800/30 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Globe className="text-amber-500" />
                      All Authenticated Users
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      A global list of every user who has ever logged into the platform.
                    </p>
                  </div>
                  <button onClick={fetchUsers} className="p-2 text-slate-400 hover:text-amber-500 transition-colors">
                    <RefreshCw size={20} className={isLoadingUsers ? "animate-spin" : ""} />
                  </button>
                </div>
                
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                        <th className="p-4">User Details</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Signed Up</th>
                        <th className="p-4">Last Login</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                      {allUsers.length === 0 ? (
                         <tr>
                           <td colSpan={4} className="p-8 text-center text-slate-500">
                              {isLoadingUsers ? "Loading users..." : "No users found in the system."}
                           </td>
                         </tr>
                      ) : (
                        allUsers.map(user => {
                          const displayName = user.full_name || (user.email ? user.email.split('@')[0] : 'Unknown');
                          const initial = displayName.charAt(0).toUpperCase();
                          return (
                          <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt={displayName} className="w-8 h-8 rounded-full border border-slate-300" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs">
                                    {initial}
                                  </div>
                                )}
                                <span className="font-semibold text-slate-900 dark:text-white">{displayName}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                              {user.email}
                            </td>
                            <td className="p-4">
                               <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                 user.role === 'admin' ? 'bg-emerald-100 text-emerald-700' :
                                 user.role === 'banned' ? 'bg-red-100 text-[#FF0000]' :
                                 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                               }`}>
                                 {user.role || 'user'}
                               </span>
                            </td>
                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                            </td>
                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Unknown'}
                            </td>
                          </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
             </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
