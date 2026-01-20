import React, { useEffect, useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AppDrawer } from './AppDrawer';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { AddTransactionDialog } from './AddTransactionDialog';
import { useAuth } from '../hooks/useAuth';
import { db } from '../db';
import type { Category } from '../types/models';
import { LoadingFallback } from './LoadingFallback';

const drawerWidth = 240;

export const AppShell: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    (async () => {
      setLoadingCategories(true);
      const list = await db.categories.where('userId').equals(user.id).toArray();
      setCategories(list);
      setLoadingCategories(false);
    })();
  }, [user]);

  if (!user) {
    return null;
  }

  if (loadingCategories) {
    return <LoadingFallback message="Carregando categorias..." />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppDrawer
        open={isDesktop || drawerOpen}
        variant={isDesktop ? 'permanent' : 'temporary'}
        onClose={() => setDrawerOpen(false)}
        width={drawerWidth}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <TopBar onOpenDrawer={() => setDrawerOpen(true)} onAdd={() => setAdding(true)} />
        <Box sx={{ p: { xs: 2, md: 3 }, pt: 0, pb: { xs: 10, md: 2 } }}>
          <Outlet />
        </Box>
        {!isDesktop && <MobileBottomNav />}
      </Box>
      <AddTransactionDialog open={adding} onClose={() => setAdding(false)} categories={categories} userId={user.id} />
    </Box>
  );
};
