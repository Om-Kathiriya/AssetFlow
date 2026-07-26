import React, { useState } from 'react';
import { DepartmentsTab } from '../components/organization/DepartmentsTab';
import { CategoriesTab } from '../components/organization/CategoriesTab';
import { EmployeesTab } from '../components/organization/EmployeesTab';
import { Building2, Tag, Users } from 'lucide-react';

export const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'categories', label: 'Asset Categories', icon: Tag },
    { id: 'employees', label: 'Employee Directory', icon: Users },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          Organization Setup
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage master data: department hierarchies, asset category warranty rules, and employee role promotions.
        </p>
      </div>

      {/* Tab Header Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body Content */}
      <div>
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'employees' && <EmployeesTab />}
      </div>
    </div>
  );
};
