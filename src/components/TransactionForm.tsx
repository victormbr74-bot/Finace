import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Stack,
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
} from '@mui/material';
import type { Category } from '../types/models';

const paymentMethods = ['Dinheiro', 'Cartão', 'PIX', 'Boleto'];

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .number()
    .min(0.01, 'O valor precisa ser maior que zero'),
  date: z.string().min(1, 'Informe a data'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  description: z.string().max(200).optional(),
  paymentMethod: z.string().optional(),
  recurring: z.boolean().optional(),
});

export type TransactionFormValues = z.infer<typeof schema>;

type TransactionFormProps = {
  categories: Category[];
  onSubmit: (values: TransactionFormValues) => Promise<void> | void;
  defaultValues?: Partial<TransactionFormValues>;
};

export const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  onSubmit,
  defaultValues,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      categoryId: categories[0]?.id ?? '',
      recurring: false,
      ...defaultValues,
    },
  });

  const handleFormSubmit = async (values: TransactionFormValues) => {
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing={2}>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="type-label">Tipo</InputLabel>
              <Select labelId="type-label" label="Tipo" {...field}>
                <MenuItem value="income">Receita</MenuItem>
                <MenuItem value="expense">Despesa</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <TextField
          label="Valor"
          type="number"
          inputProps={{ step: '0.01' }}
          error={!!errors.amount}
          helperText={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <TextField
          label="Data"
          type="date"
          InputLabelProps={{ shrink: true }}
          {...register('date')}
          error={!!errors.date}
          helperText={errors.date?.message}
        />
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.categoryId}>
              <InputLabel id="category-label">Categoria</InputLabel>
              <Select labelId="category-label" label="Categoria" {...field}>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <TextField
          label="Descrição"
          multiline
          rows={2}
          {...register('description')}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="payment-label">Forma de pagamento</InputLabel>
              <Select labelId="payment-label" label="Forma de pagamento" {...field}>
                <MenuItem value="">Selecione</MenuItem>
                {paymentMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Controller
          name="recurring"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value ?? false} onChange={(event) => field.onChange(event.target.checked)} />}
              label="Recorrente"
            />
          )}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Salvar transação
        </Button>
      </Stack>
    </form>
  );
};
