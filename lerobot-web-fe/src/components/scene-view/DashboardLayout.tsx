import { Box, Typography, Paper } from '@mui/material';
import { MainScene } from './MainScene';
import { Robot } from './Robot';
import { CameraFeed } from './CameraFeed';

interface DashboardLayoutProps {
  cameraCount?: number;
}

export function DashboardLayout({ cameraCount = 0 }: DashboardLayoutProps) {
  const cameras = Array.from({ length: cameraCount }).map((_, i) => (
    <Paper key={i} elevation={3} sx={{ mb: 3, height: '23vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" align="center" sx={{ p: 1 }}>
        Camera {i + 1}
      </Typography>
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CameraFeed />
      </Box>
    </Paper>
  ));

  return (
    <Box sx={{ display: 'flex', height: '80vh', p: 2, gap: 2 }}>
      <Box sx={{ flex: 2, height: '100%' }}>
        <MainScene>
          <Robot />
        </MainScene>
      </Box>

      {cameraCount > 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            objectFit: 'contain',
          }}
        >
          {cameras}
        </Box>
      )}
    </Box>
  );
}
