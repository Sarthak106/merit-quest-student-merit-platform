import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Calendar, DollarSign, Users, Award, Clock,
  CheckCircle, XCircle, Send, Building, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ScholarshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [scholarship, setScholarship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [statement, setStatement] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [appPage, setAppPage] = useState(0);
  const [appTotalPages, setAppTotalPages] = useState(0);
  const [eligible, setEligible] = useState(null);
  const [showEligible, setShowEligible] = useState(false);

  const role = user?.role;
  const isStudent = role === 'STUDENT';
  const canManage = ['NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN'].includes(role);
  const isOwner = scholarship?.postedById === user?.userId;

  useEffect(() => { fetchScholarship(); }, [id]);
  useEffect(() => { if (canManage && id) fetchApplications(); }, [id, appPage]);

  const fetchScholarship = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/scholarships/${id}`);
      setScholarship(data.data);
    } catch {
      toast.error('Failed to load scholarship');
      navigate('/scholarships');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data } = await api.get(`/scholarships/${id}/applications`, { params: { page: appPage, size: 20 } });
      setApplications(data.data?.content || []);
      setAppTotalPages(data.data?.totalPages || 0);
    } catch {
      // silently fail if not authorized
    }
  };

  const fetchEligible = async () => {
    try {
      const { data } = await api.get(`/scholarships/${id}/eligible-students`);
      setEligible(data.data);
      setShowEligible(true);
    } catch {
      toast.error('Failed to load eligible students');
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/scholarships/apply', { scholarshipId: Number(id), statement });
      toast.success('Application submitted successfully!');
      setShowApplyForm(false);
      setStatement('');
      fetchScholarship();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      await api.delete(`/scholarships/${id}/withdraw`);
      toast.success('Application withdrawn');
      fetchScholarship();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    }
  };

  const handleDecision = async (applicationId, approved, comment = '') => {
    try {
      await api.post(`/scholarships/applications/${applicationId}/decide`, { approved, comment });
      toast.success(approved ? 'Application approved' : 'Application rejected');
      fetchApplications();
      fetchScholarship();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Decision failed');
    }
  };

  const handleClose = async () => {
    try {
      await api.post(`/scholarships/${id}/close`);
      toast.success('Scholarship closed');
      fetchScholarship();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close');
    }
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return 'Variable';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!scholarship) return null;

  const deadlinePassed = scholarship.applicationDeadline && new Date(scholarship.applicationDeadline) < new Date();
  const canApply = isStudent && scholarship.status === 'ACTIVE' && !scholarship.hasApplied && !deadlinePassed;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/scholarships')}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Scholarships
      </button>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{scholarship.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-gray-500">
              <Building className="w-4 h-4" />
              <span>{scholarship.organizationName}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                scholarship.organizationType === 'NGO' ? 'bg-purple-100 text-purple-700' :
                scholarship.organizationType === 'GOVERNMENT' ? 'bg-blue-100 text-blue-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {scholarship.organizationType}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            scholarship.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
            scholarship.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {scholarship.status}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-semibold text-gray-900">{formatCurrency(scholarship.amount, scholarship.currency)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Deadline</p>
            <p className="font-semibold text-gray-900">{scholarship.applicationDeadline ? formatDate(scholarship.applicationDeadline) : 'Open'}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Slots</p>
            <p className="font-semibold text-gray-900">{scholarship.totalSlots ? `${scholarship.filledSlots}/${scholarship.totalSlots}` : 'Unlimited'}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <Award className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Applicants</p>
            <p className="font-semibold text-gray-900">{scholarship.applicationCount || 0}</p>
          </div>
        </div>

        {/* Description */}
        {scholarship.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{scholarship.description}</p>
          </div>
        )}

        {/* Eligibility Criteria */}
        {scholarship.eligibilityCriteria && Object.keys(scholarship.eligibilityCriteria).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {scholarship.eligibilityCriteria.minCompositeScore != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Minimum Merit Score: <strong>{scholarship.eligibilityCriteria.minCompositeScore}</strong></span>
                </div>
              )}
              {scholarship.eligibilityCriteria.grades?.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Grades: <strong>{scholarship.eligibilityCriteria.grades.join(', ')}</strong></span>
                </div>
              )}
              {scholarship.eligibilityCriteria.districts?.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-green-500" />
                  <span>Districts: <strong>{scholarship.eligibilityCriteria.districts.join(', ')}</strong></span>
                </div>
              )}
              {scholarship.eligibilityCriteria.boards?.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span>Boards: <strong>{scholarship.eligibilityCriteria.boards.join(', ')}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {scholarship.startDate && <span>Starts: {formatDate(scholarship.startDate)}</span>}
          {scholarship.endDate && <span>Ends: {formatDate(scholarship.endDate)}</span>}
          <span>Posted: {formatDate(scholarship.createdAt)}</span>
          <span>By: {scholarship.postedByName}</span>
        </div>
      </motion.div>

      {/* Student Actions */}
      {isStudent && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="card">
          {scholarship.hasApplied ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">You have applied to this scholarship</p>
                  <p className="text-sm text-gray-500">Your application is being reviewed</p>
                </div>
              </div>
              <button
                onClick={handleWithdraw}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                Withdraw
              </button>
            </div>
          ) : canApply ? (
            !showApplyForm ? (
              <button
                onClick={() => setShowApplyForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                Apply Now
              </button>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Apply to {scholarship.title}</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Statement (optional)
                  </label>
                  <textarea
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Tell us why you deserve this scholarship..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {applying ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setShowApplyForm(false); setStatement(''); }}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center gap-3 text-gray-500">
              <Clock className="w-5 h-5" />
              <span>
                {deadlinePassed ? 'The application deadline has passed' :
                 scholarship.status !== 'ACTIVE' ? 'This scholarship is no longer active' :
                 'You cannot apply to this scholarship'}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Manager Actions */}
      {canManage && (isOwner || role === 'SYSTEM_ADMIN') && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="card">
          <div className="flex flex-wrap gap-3">
            {scholarship.status === 'ACTIVE' && (
              <>
                <button
                  onClick={() => navigate(`/scholarships/${id}/edit`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Edit Scholarship
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Close Scholarship
                </button>
              </>
            )}
            <button
              onClick={fetchEligible}
              className="px-4 py-2 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
            >
              View Eligible Students
            </button>
          </div>
        </motion.div>
      )}

      {/* Eligible Students */}
      {showEligible && eligible && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Eligible Students ({eligible.totalEligible})
            </h3>
            <button onClick={() => setShowEligible(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          {eligible.students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eligible.students.map((s) => (
                    <tr key={s.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{s.studentName}</p>
                        <p className="text-xs text-gray-500">{s.enrollmentNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.grade}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.institutionName}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.compositeScore.toFixed(4)}</td>
                      <td className="px-4 py-3">
                        {s.alreadyApplied ? (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">Applied</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Not Applied</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No eligible students found based on criteria.</p>
          )}
        </motion.div>
      )}

      {/* Applications (for managers) */}
      {canManage && applications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications ({scholarship.applicationCount})</h3>
          <div className="space-y-3">
            {applications.map((app) => (
              <ApplicationCard key={app.id} app={app} onDecision={handleDecision} />
            ))}
          </div>
          {appTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setAppPage(p => Math.max(0, p - 1))}
                disabled={appPage === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">Page {appPage + 1} of {appTotalPages}</span>
              <button
                onClick={() => setAppPage(p => Math.min(appTotalPages - 1, p + 1))}
                disabled={appPage >= appTotalPages - 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function ApplicationCard({ app, onDecision }) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600',
    WITHDRAWN: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <p className="font-medium text-gray-900">{app.studentName}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
              {app.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {app.enrollmentNumber} &middot; Grade {app.grade} &middot; {app.institutionName}
            {app.meritScoreAtApplication != null && (
              <span className="ml-2 font-medium text-indigo-600">
                Score: {Number(app.meritScoreAtApplication).toFixed(4)}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {app.statement && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Statement:</p>
              <p className="text-sm text-gray-700">{app.statement}</p>
            </div>
          )}
          <p className="text-xs text-gray-500">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>

          {app.status === 'PENDING' && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onDecision(app.id, true, comment)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => onDecision(app.id, false, comment)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          )}

          {app.reviewerName && (
            <p className="text-xs text-gray-500">
              Reviewed by {app.reviewerName}
              {app.reviewerComment && ` — "${app.reviewerComment}"`}
              {app.reviewedAt && ` on ${new Date(app.reviewedAt).toLocaleDateString()}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
