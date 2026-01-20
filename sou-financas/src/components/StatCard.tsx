import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

type StatCardProps = {
  label: string;
  value: string;
  caption?: string;
  color?: string;
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, caption, color }) => (
  <Card elevation={3} sx={{ minWidth: 160, backgroundColor: color ? `${color}10` : undefined }}>
    <CardContent>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5">{value}</Typography>
      {caption && (
        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
      )}
    </CardContent>
  </Card>
);
