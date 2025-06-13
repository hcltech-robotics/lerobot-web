import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import {
  Box,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SettingsIcon from '@mui/icons-material/Settings';
import PsychologyIcon from '@mui/icons-material/Psychology';

import { DrawerHeader } from './DrawerHeader';
import { AppBar } from './AppBar';
import { Drawer } from './Drawer';

import Teleoperate from '../../Teleoperate';
import Calibration from '../../Calibration';
import Policies from '../../Policies';
import AITraining from '../../AITraining';
import RobotArmIcon from './RobotArmIcon';

const pages = [
  { label: 'Teleoperate', icon: <PrecisionManufacturingIcon />, component: <Teleoperate /> },
  { label: 'Calibration', icon: <SettingsIcon />, component: <Calibration /> },
  { label: 'Policies', icon: <PsychologyIcon />, component: <Policies /> },
  { label: 'AI Training', icon: <ModelTrainingIcon />, component: <AITraining /> },
];
export default function DrawerMenu({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [SelectedIndex, setSelectedIndex] = React.useState(0);
  const [robotStatus, setRobotStatus] = React.useState([false, true]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={[
                  {
                    marginRight: 5,
                  },
                  open && { display: 'none' },
                ]}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Lerobot Robot Arm
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {robotStatus.map((isActive, index) => (
                <RobotArmIcon key={index} isActive={isActive} />
              ))}
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>{theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {pages.map((page, index) => (
              <ListItem key={page.label} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  selected={SelectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    justifyContent: open ? 'initial' : 'center',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: 'center',
                      mr: open ? 3 : 'auto',
                    }}
                  >
                    {page.icon}
                  </ListItemIcon>
                  <ListItemText primary={page.label} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          {pages[SelectedIndex]?.component}
          {children}
        </Box>
      </Box>
    </>
  );
}
