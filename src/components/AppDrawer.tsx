import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ListAlt as ListIcon,
  Savings as SavingsIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

type AppDrawerProps = {
  open: boolean;
  variant: 'permanent' | 'temporary';
  onClose: () => void;
  width?: number;
};

const navItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: <DashboardIcon /> },
  { label: 'Transações', path: '/app/transactions', icon: <ListIcon /> },
  { label: 'Poupança', path: '/app/savings', icon: <SavingsIcon /> },
  { label: 'Relatórios', path: '/app/reports', icon: <BarChartIcon /> },
  { label: 'Perfil', path: '/app/profile', icon: <PersonIcon /> },
];

export const AppDrawer: React.FC<AppDrawerProps> = ({ open, variant, onClose, width = 240 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const drawerContent = (
    <Box sx={{ width, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Menu
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer variant={variant} open={open} onClose={onClose} ModalProps={{ keepMounted: true }}>
      {drawerContent}
    </Drawer>
  );
};
