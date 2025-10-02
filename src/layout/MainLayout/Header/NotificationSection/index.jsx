import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Button,
  Chip,
  ClickAwayListener,
  Fade,
  Grid,
  Paper,
  Popper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  ListItemSecondaryAction,
  Typography,
  ListItemButton
} from '@mui/material';

// third party
import PerfectScrollbar from 'react-perfect-scrollbar';

// assets
import QueryBuilderTwoToneIcon from '@mui/icons-material/QueryBuilderTwoTone';
import NotificationsNoneTwoToneIcon from '@mui/icons-material/NotificationsNoneTwoTone';

import User1 from 'assets/images/users/avatar-1.jpg';
import User2 from 'assets/images/users/avatar-2.jpg';
import User3 from 'assets/images/users/avatar-3.jpg';
import User4 from 'assets/images/users/avatar-4.jpg';

// ==============================|| NOTIFICATION ||============================== //

import { useNotifications } from 'contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationSection = () => {
  const theme = useTheme();
  const { notifications } = useNotifications();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const navigate = useNavigate();

  // State for highlight and click
  const [highlightIdx, setHighlightIdx] = React.useState(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleNotificationClick = (notifIdx) => {
    setOpen(false);
    setHighlightIdx(notifIdx);
    navigate('/notifications', { state: { highlightIdx: notifIdx } });
    setTimeout(() => setHighlightIdx(null), 2000); // Remove highlight after 2s
  };


  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Button
        sx={{
          minWidth: { sm: 50, xs: 35 }
        }}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        aria-label="Notification"
        onClick={handleToggle}
        color="inherit"
      >
        <NotificationsNoneTwoToneIcon sx={{ fontSize: '1.5rem' }} />
      </Button>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10]
            }
          },
          {
            name: 'preventOverflow',
            options: {
              altAxis: true // false by default
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <List
                  sx={{
                    width: '100%',
                    maxWidth: 350,
                    minWidth: 250,
                    backgroundColor: theme.palette.background.paper,
                    pb: 0,
                    borderRadius: '10px'
                  }}
                >
                  <PerfectScrollbar style={{ height: 320, overflowX: 'hidden' }}>
                    <ListSubheader disableSticky>
                      <Chip size="small" color="primary" label="New" />
                    </ListSubheader>
                    {notifications.filter(n => n.status === 'Belum Dibaca').length === 0 && (
                      <ListItem><ListItemText primary="Tidak ada notifikasi baru" /></ListItem>
                    )}
                    {notifications.filter(n => n.status === 'Belum Dibaca').map((notif, idx) => (
                      <ListItemButton
                        alignItems="flex-start"
                        key={idx}
                        sx={{ pt: 0, bgcolor: highlightIdx === idx ? 'rgba(33,150,243,0.15)' : undefined }}
                        onClick={() => handleNotificationClick(idx)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}><NotificationsNoneTwoToneIcon /></Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="subtitle1">Notifikasi</Typography>}
                          secondary={<Typography variant="subtitle2">{notif.pesan}</Typography>}
                        />
                        <ListItemSecondaryAction sx={{ top: 22 }}>
                          <Grid container justifyContent="flex-end">
                            <Grid item>
                              <QueryBuilderTwoToneIcon sx={{ fontSize: '0.75rem', mr: 0.5, color: theme.palette.grey[400] }} />
                            </Grid>
                            <Grid item>
                              <Typography variant="caption" display="block" gutterBottom sx={{ color: theme.palette.grey[400] }}>
                                {notif.waktu}
                              </Typography>
                            </Grid>
                          </Grid>
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    ))}
                    <ListSubheader disableSticky>
                      <Chip size="small" variant="outlined" label="EARLIER" />
                    </ListSubheader>
                    {notifications.filter(n => n.status === 'Dibaca').length === 0 && (
                      <ListItem><ListItemText primary="(Coming Soon) Tidak ada notifikasi lama" /></ListItem>
                    )}
                    {notifications.filter(n => n.status === 'Dibaca').map((notif, idx) => (
                      <ListItemButton alignItems="flex-start" key={idx}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}><NotificationsNoneTwoToneIcon /></Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="subtitle1">Notifikasi</Typography>}
                          secondary={<Typography variant="subtitle2">{notif.pesan}</Typography>}
                        />
                        <ListItemSecondaryAction sx={{ top: 22 }}>
                          <Grid container justifyContent="flex-end">
                            <Grid item>
                              <QueryBuilderTwoToneIcon sx={{ fontSize: '0.75rem', mr: 0.5, color: theme.palette.grey[400] }} />
                            </Grid>
                            <Grid item>
                              <Typography variant="caption" display="block" gutterBottom sx={{ color: theme.palette.grey[400] }}>
                                {notif.waktu}
                              </Typography>
                            </Grid>
                          </Grid>
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    ))}
                  </PerfectScrollbar>
                </List>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default NotificationSection;
