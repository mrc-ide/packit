import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../providers/UserProvider";
import { useRedirectOnLogin } from "../providers/RedirectOnLoginProvider";

export default function Redirect() {
  console.log("Redirecting...")
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { requestedUrl, setRequestedUrl } = useRedirectOnLogin();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const navigateToRequestedUrl  = () => {
    const url = requestedUrl || "/";
    setRequestedUrl(null); // reset requested url before redirecting
    navigate(url);
  };

  useEffect(() => {
    if (user?.token) {
      navigateToRequestedUrl();
    } else if (token) {
      setUser(token);
    }
    if (error) {
      navigate(`/login?error=${error}`);
    }
  }, [token, error, user?.token]);

  return (
    <div>
      <p>Redirecting user ...</p>
    </div>
  );
}
