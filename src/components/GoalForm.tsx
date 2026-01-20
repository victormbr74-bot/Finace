import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';

const schema = z.object({
  name: z.string().min(3, 'Informe um nome'),
  initialAmount: z.number().min(0, 'Valor inicial precisa ser positivo'),
  monthlyIncrease: z.number().min(0, 'Aumento nao pode ser negativo'),
  startDate: z.string().min(1, 'Informe a data'),
  mode: z.enum(['targetValue', 'durationMonths']),
  targetValue: z.number().optional(),
  durationMonths: z.number().optional(),
  interestMode: z.enum(['none', 'percent', 'fixed']),
  interestValue: z.number().optional(),
});

export type GoalFormValues = z.infer<typeof schema>;

type GoalFormProps = {
  onSubmit: (values: GoalFormValues) => Promise<void> | void;
  defaultValues?: Partial<GoalFormValues>;
};

export const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, defaultValues }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      initialAmount: 0,
      monthlyIncrease: 0,
      startDate: new Date().toISOString().slice(0, 7),
      mode: 'targetValue',
      interestMode: 'none',
      ...defaultValues,
    },
  });

  const mode = watch('mode');
  const interestMode = watch('interestMode');

  const handleFormSubmit = async (values: GoalFormValues) => {
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing={2}>
        <TextField label="Nome do objetivo" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        <TextField
          label="Valor inicial"
          type="number"
          {...register('initialAmount', { valueAsNumber: true })}
          error={!!errors.initialAmount}
          helperText={errors.initialAmount?.message}
        />
        <TextField
          label="Aumento mensal"
          type="number"
          {...register('monthlyIncrease', { valueAsNumber: true })}
          error={!!errors.monthlyIncrease}
          helperText={errors.monthlyIncrease?.message}
        />
        <TextField
          label="Mes inicial"
          type="month"
          InputLabelProps={{ shrink: true }}
          {...register('startDate')}
          error={!!errors.startDate}
          helperText={errors.startDate?.message}
        />
        <Controller
          name="mode"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="mode-label">Tipo de meta</InputLabel>
              <Select labelId="mode-label" label="Tipo de meta" {...field}>
                <MenuItem value="targetValue">Valor alvo</MenuItem>
                <MenuItem value="durationMonths">Duracao (meses)</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        {mode === 'targetValue' ? (
          <TextField
            label="Valor alvo"
            type="number"
            {...register('targetValue', { valueAsNumber: true })}
            error={!!errors.targetValue}
            helperText={errors.targetValue?.message}
          />
        ) : (
          <TextField
            label="Duracao em meses"
            type="number"
            {...register('durationMonths', { valueAsNumber: true })}
            error={!!errors.durationMonths}
            helperText={errors.durationMonths?.message}
          />
        )}
        <Controller
          name="interestMode"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="interest-label">Juros ou ganho</InputLabel>
              <Select labelId="interest-label" label="Juros ou ganho" {...field}>
                <MenuItem value="none">Nenhum</MenuItem>
                <MenuItem value="percent">Percentual mensal (%)</MenuItem>
                <MenuItem value="fixed">Valor fixo extra</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        {interestMode !== 'none' && (
          <TextField
            label="Valor de juros"
            type="number"
            {...register('interestValue', { valueAsNumber: true })}
            error={!!errors.interestValue}
            helperText={errors.interestValue?.message}
          />
        )}
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Salvar objetivo
        </Button>
      </Stack>
    </form>
  );
};
