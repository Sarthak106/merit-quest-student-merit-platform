import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  BarChart3, Users, ClipboardCheck, Award, GraduationCap, Shield, BookOpen,
} from 'lucide-react';
import AnimatedCard from '../components/ui/AnimatedCard';
import PageTransition from '../components/ui/PageTransition';
import { StaggerContainer, StaggerItem } from '../components/ui/StaggerContainer';

const ROLE_CONFIG = {
  STUDENT: {
    title: 'Student Dashboard',
    subtitle: 'Track your academic performance and discover scholarships',
    icon: GraduationCap,
    gradient: 'from-indigo-600 to-blue-600',
    cards: [
      { title: 'My Performance',  desc: 'View grades, ranking, and trends',     icon: BarChart3, path: '/performance' },
      { title: 'Merit Score',     desc: 'Your composite merit ranking',          icon: Award, path: '/merit' },
      { title: 'Scholarships',    desc: 'Discover and apply for scholarships',   icon: BookOpen, path: '/scholarships' },
    ],
  },
  PARENT: {
    title: 'Parent Dashboard',
    subtitle: "Monitor your child's academic journey",
    icon: Users,
    gradient: 'from-purple-600 to-indigo-600',
    cards: [
      { title: 'Child Performance', desc: 'Track academic progress',      icon: BarChart3, path: '/performance' },
      { title: 'Merit Ranking',     desc: 'See ranking across schools',    icon: Award, path: '/merit' },
      { title: 'Scholarships',      desc: 'Scholarship opportunities',     icon: BookOpen, path: '/scholarships' },
    ],
  },
  SCHOOL_ADMIN: {
    title: 'School Administrator',
    subtitle: 'Manage student records and institutional data',
    icon: Shield,
    gradient: 'from-emerald-600 to-teal-600',
    cards: [
      { title: 'Student Records',  desc: 'Manage and upload student data',     icon: Users, path: '/students' },
      { title: 'Bulk Uploads',     desc: 'CSV / Excel batch import',            icon: ClipboardCheck, path: '/upload' },
      { title: 'School Analytics', desc: 'Performance overview & trends',       icon: BarChart3, path: '/analytics' },
      { title: 'Merit Lists',     desc: 'View school-level rankings',           icon: Award, path: '/merit' },
    ],
  },
  DATA_VERIFIER: {
    title: 'Data Verifier',
    subtitle: 'Review and approve submitted student records',
    icon: ClipboardCheck,
    gradient: 'from-amber-600 to-orange-600',
    cards: [
      { title: 'Verification Queue', desc: 'Pending records to review',      icon: ClipboardCheck, path: '/verification' },
      { title: 'Merit Lists',        desc: 'View merit rankings',            icon: Award, path: '/merit' },
      { title: 'Audit Log',          desc: 'Activity history',               icon: BarChart3, path: '/audit-log' },
    ],
  },
  NGO_REP: {
    title: 'NGO Dashboard',
    subtitle: 'Post scholarships and track student outreach impact',
    icon: BookOpen,
    gradient: 'from-green-600 to-emerald-600',
    cards: [
      { title: 'Post Scholarship',  desc: 'Create new scholarship offers',     icon: BookOpen, path: '/scholarships/create' },
      { title: 'Applicants',        desc: 'Review student applications',        icon: Users, path: '/applicants' },
      { title: 'Impact Analytics',  desc: 'Track reach and outcomes',           icon: BarChart3, path: '/analytics' },
    ],
  },
  GOV_AUTHORITY: {
    title: 'Government Dashboard',
    subtitle: 'Regional analytics, merit insights, and policy tools',
    icon: Shield,
    gradient: 'from-indigo-600 to-violet-600',
    cards: [
      { title: 'Regional Analytics', desc: 'District and state performance',   icon: BarChart3, path: '/analytics' },
      { title: 'Merit Rankings',     desc: 'Cross-school merit comparisons',   icon: Award, path: '/merit' },
      { title: 'Scholarships',       desc: 'Manage government scholarships',   icon: BookOpen, path: '/scholarships' },
      { title: 'Audit Logs',         desc: 'System activity audit trail',      icon: ClipboardCheck, path: '/audit-log' },
    ],
  },
  SYSTEM_ADMIN: {
    title: 'System Administration',
    subtitle: 'Full platform management and monitoring',
    icon: Shield,
    gradient: 'from-red-600 to-rose-600',
    cards: [
      { title: 'User Management',   desc: 'Manage all users and roles',       icon: Users, path: '/admin/users' },
      { title: 'Institutions',      desc: 'Manage schools and colleges',      icon: Shield, path: '/admin/institutions' },
      { title: 'System Analytics',  desc: 'Platform-wide stats',              icon: BarChart3, path: '/analytics' },
      { title: 'Audit Logs',        desc: 'Complete audit trail',             icon: ClipboardCheck, path: '/audit-log' },
      { title: 'ML Models',         desc: 'Manage prediction models',         icon: Award, path: '/admin/ml-models' },
    ],
  },
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const config = ROLE_CONFIG[user?.role] || ROLE_CONFIG.STUDENT;
  const Icon = config.icon;

  return (
    <PageTransition className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-sm`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
          <p className="text-slate-500">{config.subtitle}</p>
        </div>
      </motion.div>

      {/* Quick action cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {config.cards.map((card) => {
          const CardIcon = card.icon;
          return (
            <StaggerItem key={card.title}>
              <AnimatedCard onClick={() => navigate(card.path)} className="h-full">
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-sm`}>
                    <CardIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{card.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{card.desc}</p>
                  </div>
                </div>
              </AnimatedCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden"
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-[0.04]`} />
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-slate-900">
            Welcome, <span className="text-indigo-700">{user?.firstName} {user?.lastName}</span>!
          </h2>
          <p className="mt-2 text-slate-500">
            You are signed in as <strong className="text-slate-700">{user?.role?.replace('_', ' ')}</strong>.
            Use the sidebar to navigate through available features.
          </p>
        </div>
      </motion.div>
    </PageTransition>
  );
}
