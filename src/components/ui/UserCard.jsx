import React from 'react';
import { Shield, User, Trash2, Mail } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Card from '../common/Card';

const UserCard = ({ 
  name, 
  email, 
  role = 'user',
  onRemove 
}) => {
  const isAdmin = role === 'admin';

  return (
    <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 shadow-md hover:shadow-xl group">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
        {/* User Info Section */}
        <div className="flex items-start gap-4 flex-1 w-full sm:w-auto">
          {/* Avatar */}
          <div className={`p-4 rounded-xl shadow-md ${
            isAdmin 
              ? 'bg-gradient-to-br from-emerald-400 to-blue-500' 
              : 'bg-gradient-to-br from-slate-400 to-slate-600'
          }`}>
            {isAdmin ? (
              <Shield size={24} className="text-white" />
            ) : (
              <User size={24} className="text-white" />
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                {name}
              </h3>
              <Badge 
                variant={isAdmin ? 'primary' : 'default'}
                className={`${
                  isAdmin 
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-md' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                } font-bold uppercase text-xs`}
              >
                {isAdmin ? (
                  <span className="flex items-center gap-1.5">
                    <Shield size={12} />
                    Admin
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <User size={12} />
                    User
                  </span>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail size={14} className="flex-shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {onRemove && isAdmin && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRemove}
            className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-500/30 text-[#FF0000] dark:text-[#FF0000] hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-500 dark:hover:border-red-500 font-semibold w-full sm:w-auto transition-all duration-300"
            icon={Trash2}
          >
            Remove Admin
          </Button>
        )}
      </div>
    </Card>
  );
};

export default UserCard;
