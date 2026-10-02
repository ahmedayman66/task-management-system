import React from 'react';
import { Layers } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Layers,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  action = null
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
