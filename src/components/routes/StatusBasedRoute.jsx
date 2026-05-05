import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Routes that are accessible regardless of account status
const PUBLIC_WHEN_PENDING = ['/profile', '/messages'];
const PUBLIC_WHEN_REJECTED = ['/profile', '/messages'];

export default function StatusBasedRoute({ children, requiredStatus = null }) {
  const { user, isApproved, isPending, isRejected, hasPendingChanges } = useAuth();

  // If no specific status required, allow access
  if (!requiredStatus) {
    return children;
  }

  // If user is approved, allow full access
  if (isApproved) {
    return children;
  }

  // If user is pending
  if (isPending) {
    if (requiredStatus === 'pending') {
      return children;
    }
    // Pending users can access profile and messages
    if (PUBLIC_WHEN_PENDING.some(path => children.props?.children?.type?.name?.includes(path))) {
      return children;
    }
    // Show pending warning
    return <PendingWarning user={user} hasChanges={hasPendingChanges} />;
  }

  // If user is rejected
  if (isRejected) {
    if (requiredStatus === 'rejected') {
      return children;
    }
    // Rejected users can only access profile to update and resubmit
    return <RejectedWarning user={user} />;
  }

  return children;
}

function PendingWarning({ user, hasChanges }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-md rounded-2xl border border-yellow-500/30 p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Account Pending Approval</h2>
          <p className="text-white/70 mb-6">
            Your account is currently under review. You will be notified once an admin approves your registration.
          </p>
          
          {hasChanges && (
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                You have pending changes that are being reviewed.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <a 
              href="/profile" 
              className="block w-full bg-yellow-500/20 text-yellow-400 py-3 rounded-lg hover:bg-yellow-500/30 transition-colors"
            >
              Update Profile
            </a>
            <a 
              href="/" 
              className="block w-full bg-white/10 text-white py-3 rounded-lg hover:bg-white/20 transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectedWarning({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-md rounded-2xl border border-red-500/30 p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Account Rejected</h2>
          <p className="text-white/70 mb-4">
            Your registration has been declined.
          </p>
          
          {user?.rejection_reason && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm font-medium mb-1">Reason:</p>
              <p className="text-white/80 text-sm">{user.rejection_reason}</p>
            </div>
          )}

          <div className="space-y-3">
            <a 
              href="/profile" 
              className="block w-full bg-green-500/20 text-green-400 py-3 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              Update Profile & Resubmit
            </a>
            <a 
              href="/" 
              className="block w-full bg-white/10 text-white py-3 rounded-lg hover:bg-white/20 transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

