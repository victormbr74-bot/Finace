import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Dashboard, ListAlt, Savings, BarChart, Person } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const actions = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/app/dashboard' },
  { label: 'Transações', icon: <ListAlt />, path: '/app/transactions' },
  { label: 'Poupança', icon: <Savings />, path: '/app/savings' },
  { label: 'Relatórios', icon: <BarChart />, path: '/app/reports' },
  { label: 'Perfil', icon: <Person />, path: '/app/profile' },
];

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <BottomNavigation
        value={actions.findIndex((action) => pathname.startsWith(action.path))}
        onChange={(_, value) => {
          const selected = actions[value];
          if (selected) {
            navigate(selected.path);
          }
        }}
      >
        {actions.map((action) => (
          <BottomNavigationAction key={action.path} label={action.label} icon={action.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
};
