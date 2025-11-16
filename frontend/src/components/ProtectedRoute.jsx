import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { user, loading, hasOrganization } = useAuth();

  // This is the part we will beautify
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // This logic is complex, so let's check the user's intended destination.
  // We can get this from the `children` prop's type.
  const isTargetingOnboarding = children.type.name === "OnboardingPage";

  if (!hasOrganization && !isTargetingOnboarding) {
    // If user has no org but isn't trying to go to onboarding, send them there.
    return <Navigate to="/onboarding" replace />;
  }

  if (hasOrganization && isTargetingOnboarding) {
    // If user has an org but is trying to go to onboarding, send them to the dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
