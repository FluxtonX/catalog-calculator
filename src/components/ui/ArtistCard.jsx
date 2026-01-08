import React from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Card from '../common/Card';

const UserCard = ({ 
  name, 
  email, 
  role = 'user',
  onRemove 
}) => {
  return (
    <Card className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {name}
          </h3>
          <Badge variant={role === 'admin' ? 'primary' : 'default'}>
            {role}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {email}
        </p>
      </div>
      {onRemove && role === 'admin' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRemove}
        >
          Remove Admin
        </Button>
      )}
    </Card>
  );
};

export default UserCard;