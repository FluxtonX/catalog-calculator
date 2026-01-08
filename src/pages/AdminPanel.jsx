import React, { useState } from 'react';
import { UserPlus, RefreshCw } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import UserCard from '../components/ui/UserCard';

const AdminPanel = () => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  
  const [users] = useState([
    { id: 1, name: 'muhammadnasirpk44', email: 'muhammadnasirpk44@gmail.com', role: 'admin' },
    { id: 2, name: 'Amit Noach', email: 'amitnoa@base44.com', role: 'admin' },
    { id: 3, name: 'Gigi Fortune', email: 'gigi@creativefundingagency.com', role: 'admin' },
  ]);

  const handleInvite = () => {
    console.log('Inviting user:', email, selectedRole);
    setEmail('');
  };

  const handleRemove = (userId) => {
    console.log('Removing user:', userId);
  };

  return (
    <div className="space-y-6">
      {/* Invite New User */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <UserPlus size={24} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invite New User
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="
              px-4 py-2.5 
              bg-white dark:bg-slate-800 
              border border-gray-300 dark:border-slate-600 
              rounded-lg 
              text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              transition-all duration-200
            "
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          
          <Button 
            icon={UserPlus}
            onClick={handleInvite}
            disabled={!email}
          >
            Invite
          </Button>
        </div>
      </Card>

      {/* Users List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <UserPlus size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Users ({users.length})
            </h2>
          </div>
          
          <Button variant="outline" icon={RefreshCw} size="sm">
            Refresh
          </Button>
        </div>
        
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              name={user.name}
              email={user.email}
              role={user.role}
              onRemove={() => handleRemove(user.id)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;