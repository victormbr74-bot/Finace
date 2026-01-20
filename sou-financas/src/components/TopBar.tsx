import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Box,
  Tooltip,
  Button,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7, Add } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAppTheme } from '../theme/AppThemeProvider';

const primaryColors = ['#1976d2', '#d32f2f', '#00796b', '#9e69ff', '#ff6f00'];

type TopBarProps = {
  onOpenDrawer: () => void;
  onAdd: () => void;
};

export const TopBar: React.FC<TopBarProps> = ({ onOpenDrawer, onAdd }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { mode, setMode, primaryColor, setPrimaryColor, currency, setCurrency } = useAppTheme();

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
  };

  const handleCurrency = (event: SelectChangeEvent<string>) => {
    void setCurrency(event.target.value);
  };

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2 }}>
        {!isDesktop && (
          <IconButton edge="start" onClick={onOpenDrawer} size="large">
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          Sou Finanças
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControl variant="standard" size="small">
            <Select value={currency} onChange={handleCurrency} sx={{ minWidth: 80 }}>
              <MenuItem value="BRL">BRL</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Alternar tema">
            <IconButton
              color="inherit"
              onClick={() => {
                void setMode(mode === 'dark' ? 'light' : 'dark');
              }}
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
          <Stack direction="row" spacing={1}>
            {primaryColors.map((color) => (
              <Box
                key={color}
                onClick={() => {
                  void handleColorChange(color);
                }}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: primaryColor === color ? `2px solid ${theme.palette.text.primary}` : '2px solid transparent',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Stack>
          <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
            Adicionar
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
