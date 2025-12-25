import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Book,
  People,
  Person,
  Receipt,
  Category,
  BarChart,
  AccountCircle,
  Logout,
  Settings
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const getMenuItems = () => {
    const items = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard',
        roles: ['ADMIN', 'OWNER', 'USER']
      }
    ];

    if (user?.role === 'ADMIN') {
      items.push(
        {
          text: 'Book Owners',
          icon: <People />,
          path: '/dashboard/owners',
          roles: ['ADMIN']
        },
        {
          text: 'All Books',
          icon: <Book />,
          path: '/dashboard/books',
          roles: ['ADMIN']
        },
        {
          text: 'All Rentals',
          icon: <Receipt />,
          path: '/dashboard/rentals',
          roles: ['ADMIN']
        },
        {
          text: 'Statistics',
          icon: <BarChart />,
          path: '/dashboard/stats',
          roles: ['ADMIN']
        }
      );
    }

    if (user?.role === 'OWNER') {
      items.push(
        {
          text: 'My Books',
          icon: <Book />,
          path: '/dashboard/my-books',
          roles: ['OWNER']
        },
        {
          text: 'My Rentals',
          icon: <Receipt />,
          path: '/dashboard/my-rentals',
          roles: ['OWNER']
        },
        {
          text: 'Revenue',
          icon: <BarChart />,
          path: '/dashboard/revenue',
          roles: ['OWNER']
        }
      );
    }

    if (user?.role === 'USER') {
      items.push(
        {
          text: 'Browse Books',
          icon: <Book />,
          path: '/dashboard/browse',
          roles: ['USER']
        },
        {
          text: 'My Rentals',
          icon: <Receipt />,
          path: '/dashboard/my-rentals',
          roles: ['USER']
        }
      );
    }

    items.push(
      {
        text: 'Categories',
        icon: <Category />,
        path: '/dashboard/categories',
        roles: ['ADMIN', 'OWNER', 'USER']
      },
      {
        text: 'Profile',
        icon: <Person />,
        path: '/dashboard/profile',
        roles: ['ADMIN', 'OWNER', 'USER']
      }
    );

    return items.filter(item => item.roles.includes(user?.role));
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Book Rental
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={router.pathname === item.path}
              onClick={() => router.push(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: router.pathname === item.path ? theme.palette.primary.main : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  color: router.pathname === item.path ? theme.palette.primary.main : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.role === 'ADMIN' && 'Admin Dashboard'}
            {user?.role === 'OWNER' && 'Owner Dashboard'}
            {user?.role === 'USER' && 'User Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              {user?.first_name || user?.email}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
      >
        <MenuItem onClick={() => router.push('/dashboard/profile')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Profile Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;