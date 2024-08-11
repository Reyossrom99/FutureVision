import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function useNavigationInterceptor(onNavigate) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleNavigation = (event) => {
      event.preventDefault(); // Prevent the navigation
      // Call your function before the navigation occurs
      onNavigate().finally(() => {
        navigate(location.pathname); // Navigate to the new route
      });
    };

    // Listen to the popstate event for back/forward navigation
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [location, navigate, onNavigate]);
}

export default useNavigationInterceptor;
