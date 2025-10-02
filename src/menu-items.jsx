// ==============================|| MENU ITEMS ||============================== //

// eslint-disable-next-line
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import DirectionsRailwayFilledIcon from '@mui/icons-material/DirectionsRailwayFilled';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import InputOutlinedIcon from '@mui/icons-material/InputOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'; // ✅ Fault icon
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'; // ✅ Component Usage icon
import CopyrightOutlinedIcon from '@mui/icons-material/CopyrightOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'; // ✅ Task Management icon


const icons = {
  HomeOutlinedIcon,
  AssessmentOutlinedIcon,
  DirectionsRailwayFilledIcon,
  TableChartOutlinedIcon,
  GroupOutlinedIcon,
  InputOutlinedIcon,
  AccountCircleOutlinedIcon,
  SettingsOutlinedIcon,
  CallOutlinedIcon,
  HelpOutlineOutlinedIcon,
  LogoutOutlinedIcon,
  WarningAmberOutlinedIcon,
  ListAltOutlinedIcon, // daftarkan icon baru
  CopyrightOutlinedIcon,
  AssignmentOutlinedIcon
};


// Fungsi untuk filter menu sesuai role
function getMenuItemsByRole(role = 'user') {
  // role: 'admin' atau 'user', default 'user'
  // Definisi semua menu
  const items = [
    {
      id: 'main',
      type: 'group',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: icons['HomeOutlinedIcon'],
          url: '/dashboard/default'
        },
        {
          id: 'action-plan',
          title: 'Monitoring Action Plan',
          type: 'item',
          icon: icons['AssessmentOutlinedIcon'],
          url: '/dashboard/action-plan'
        },
        {
          id: 'pantauan-roda-cc205',
          title: 'Pantauan Roda CC205',
          type: 'item',
          icon: icons['DirectionsRailwayFilledIcon'],
          url: '/dashboard/pantauan-roda-cc205'
        },
        {
          id: 'rekap-fasilitas',
          title: 'Rekap Data Fasilitas',
          type: 'item',
          icon: icons['TableChartOutlinedIcon'],
          url: '/dashboard/rekap-fasilitas'
        },
        {
          id: 'manpower',
          title: 'Manpower Data',
          type: 'item',
          icon: icons['GroupOutlinedIcon'],
          url: '/dashboard/manpower-data-manage'
        },
        {
          id: 'component-usage',
          title: 'Component Usage',
          type: 'item',
          icon: icons['TableChartOutlinedIcon'],
          url: '/dashboard/component-usage'
        },
        {
          id: 'fault-history',
          title: 'Fault History',
          type: 'item',
          icon: icons['WarningAmberOutlinedIcon'],
          url: '/dashboard/fault-history'
        },
        {
          id: 'performance-history',
          title: 'Performance History',
          type: 'item',
          icon: icons['AssessmentOutlinedIcon'],
          url: '/dashboard/performance-history'
        },
        // Task Management (Admin) hanya untuk admin
        ...(role === 'admin' ? [{
          id: 'task-management-admin',
          title: 'Manajemen Task',
          type: 'item',
          icon: icons['AssignmentOutlinedIcon'],
          url: '/dashboard/task-management-admin'
        }] : []),
        // Task Management User selalu ada
        {
          id: 'task-management-user',
          title: 'Daftar Task',
          type: 'item',
          icon: icons['AssignmentOutlinedIcon'],
          url: '/dashboard/task-management-user'
        },
        {
          id: 'input-data',
          title: 'Input Data Multi-Kategori',
          type: 'item',
          icon: icons['InputOutlinedIcon'],
          url: '/dashboard/input-data-multi-kategori'
        },
        {
          id: 'copyright',
          title: 'TIM KP ITERA',
          type: 'item',
          icon: icons['CopyrightOutlinedIcon'],
          url: '#',
        },
        {
          id: 'logout',
          title: 'Log Out',
          type: 'item',
          icon: icons['LogoutOutlinedIcon'],
          url: '/login-user'
        }
      ]
    }
  ];
  return { items };
}

export default getMenuItemsByRole;