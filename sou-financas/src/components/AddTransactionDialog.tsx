import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
  Box,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransactionForm, type TransactionFormValues } from './TransactionForm';
import { useTheme } from '@mui/material/styles';
import type { Category } from '../types/models';
import { addTransaction } from '../services/transactionService';
import { useNotification } from './NotificationProvider';

type AddTransactionDialogProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  userId: string;
};

export const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({ open, onClose, categories, userId }) => {
  const { showSuccess, showError } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (values: TransactionFormValues) => {
    try {
      await addTransaction({
        userId,
        type: values.type,
        amount: Number(values.amount),
        date: values.date,
        categoryId: values.categoryId,
        description: values.description ?? '',
        paymentMethod: values.paymentMethod,
        recurring: values.recurring,
      });
      showSuccess('Transacao salva');
      onClose();
    } catch {
      showError('Nao foi possivel salvar a transacao');
    }
  };

  if (isMobile) {
    return (
      <SwipeableDrawer anchor="bottom" open={open} onClose={onClose} onOpen={() => {}}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Nova transacao</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TransactionForm categories={categories} onSubmit={handleSubmit} />
          </Box>
        </Box>
      </SwipeableDrawer>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Nova transacao
        <IconButton
          aria-label="fechar"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TransactionForm categories={categories} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
};
