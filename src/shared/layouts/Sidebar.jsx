"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../auth/AuthProvider';
import { getMenuForRole, formatRoleLabel } from './sidebarConfig';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaidIcon from '@mui/icons-material/Paid';
import SecurityIcon from '@mui/icons-material/Security';
import BackupIcon from '@mui/icons-material/Backup';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CloudIcon from '@mui/icons-material/Cloud';
import BuildIcon from '@mui/icons-material/Build';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import EditIcon from '@mui/icons-material/Edit';
import InsightsIcon from '@mui/icons-material/Insights';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import BookIcon from '@mui/icons-material/Book';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FolderIcon from '@mui/icons-material/Folder';

const menuIconBySlug = {
  dashboard: DashboardIcon,
  'university-management': BusinessIcon,
  'university-administrators': PeopleIcon,
  'platform-users': PeopleIcon,
  'roles-permissions': SecurityIcon,
  'subscription-management': PaidIcon,
  'billing-payments': PaidIcon,
  'reports-analytics': BarChartIcon,
  monitoring: CloudIcon,
  'audit-logs': HistoryIcon,
  'security-center': SecurityIcon,
  notifications: NotificationsIcon,
  backups: BackupIcon,
  'global-settings': SettingsIcon,
  integrations: IntegrationInstructionsIcon,
  'help-documentation': HelpOutlineIcon,
  profile: AccountCircleIcon,
  logout: LogoutIcon,
  'faculty-management': ApartmentIcon,
  'department-management': AccountBalanceIcon,
  'programme-management': SchoolIcon,
  'course-management': MenuBookIcon,
  'academic-sessions': CalendarMonthIcon,
  semesters: CalendarMonthIcon,
  levels: BarChartIcon,
  'student-management': SchoolIcon,
  'staff-management': PeopleIcon,
  'user-management': PeopleIcon,
  'role-management': SecurityIcon,
  'course-registration': HowToRegIcon,
  'assessment-management': FactCheckIcon,
  'result-management': AssignmentIcon,
  'result-approval-workflow': ThumbUpOffAltIcon,
  'transcript-management': RequestPageIcon,
  'graduation-management': EmojiEventsIcon,
  reports: BarChartIcon,
  documents: DescriptionIcon,
  communication: ChatBubbleIcon,
  'faculty-overview': PeopleIcon,
  departments: AccountBalanceIcon,
  lecturers: PeopleIcon,
  students: GroupIcon,
  'faculty-reports': BarChartIcon,
  'faculty-statistics': InsightsIcon,
  'department-overview': AccountBalanceIcon,
  courses: MenuBookIcon,
  'course-allocation': AssignmentIcon,
  'assessment-review': FactCheckIcon,
  'result-verification': AssignmentIcon,
  'result-approval': ThumbUpOffAltIcon,
  'transcript-requests': RequestPageIcon,
  'graduation-clearance': EmojiEventsIcon,
  'academic-records': BookIcon,
  'my-profile': AccountCircleIcon,
  'registered-courses': ClassIcon,
  assessments: FactCheckIcon,
  results: AssignmentTurnedInIcon,
  'academic-history': HistoryIcon,
  'fee-status': AccountBalanceIcon,
  support: SupportAgentIcon,
  'profile-settings': SettingsIcon,
  'result-processing': BuildIcon,
  'result-publication': PublishedWithChangesIcon,
  'result-corrections': EditIcon,
  'academic-records': BookIcon,
  'integrations': IntegrationInstructionsIcon,
  'university-settings': SettingsIcon,
};

export default function Sidebar() {
  const { user } = useAuth();
  const items = getMenuForRole(user?.role).filter((item) => item.slug !== 'profile' && item.slug !== 'logout');

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <Image src="/urmis.png" alt="URMIS logo" width={40} height={40} className="rounded-lg bg-white/10 p-1" />
          <div>
            <h2 className="text-lg font-semibold">URMIS</h2>
            <p className="text-xs text-slate-400">{formatRoleLabel(user?.role)}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = menuIconBySlug[item.slug] || FolderIcon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Icon className="h-5 w-5 shrink-0 text-slate-300" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
