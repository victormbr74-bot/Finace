import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, type PaletteMode } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { getSettingsFor, saveSettings } from '../services/settingsService';

type AppThemeContextValue = {
  mode: PaletteMode;
  primaryColor: string;
  currency: string;
  setMode: (mode: PaletteMode) => Promise<void>;
  setPrimaryColor: (color: string) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mode, setModeState] = useState<PaletteMode>('light');
  const [primaryColor, setPrimaryColorState] = useState('#1976d2');
  const [currency, setCurrencyState] = useState('BRL');

  useEffect(() => {
    if (!user) {
      setModeState('light');
      setPrimaryColorState('#1976d2');
      setCurrencyState('BRL');
      return;
    }

    (async () => {
      const settings = await getSettingsFor(user.id);
      setModeState(settings.themeMode);
      setPrimaryColorState(settings.primaryColor);
      setCurrencyState(settings.currency);
    })();
  }, [user]);

  const persistSettings = async (next: Partial<Omit<AppThemeContextValue, 'setMode' | 'setPrimaryColor' | 'setCurrency'>>) => {
    if (!user) {
      return;
    }
    await saveSettings({
      userId: user.id,
      themeMode: next.mode ?? mode,
      primaryColor: next.primaryColor ?? primaryColor,
      currency: next.currency ?? currency,
    });
  };

  const setMode = async (next: PaletteMode) => {
    setModeState(next);
    await persistSettings({ mode: next });
  };

  const setPrimaryColor = async (color: string) => {
    setPrimaryColorState(color);
    await persistSettings({ primaryColor: color });
  };

  const setCurrency = async (nextCurrency: string) => {
    setCurrencyState(nextCurrency);
    await persistSettings({ currency: nextCurrency });
  };

  const paletteTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: primaryColor,
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", sans-serif',
        },
        components: {
          MuiButton: {
            defaultProps: {
              disableElevation: true,
            },
          },
        },
      }),
    [mode, primaryColor],
  );

  const contextValue = useMemo(
    () => ({
      mode,
      primaryColor,
      currency,
      setMode,
      setPrimaryColor,
      setCurrency,
    }),
    [mode, primaryColor, currency],
  );

  return (
    <AppThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={paletteTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = (): AppThemeContextValue => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
};
