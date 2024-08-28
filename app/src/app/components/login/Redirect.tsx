import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../providers/UserProvider";
import { useRedirectOnLogin } from "../providers/RedirectOnLoginProvider";

export default function Redirect() {
  const navigate = useNavigate();
  const { setUser } = useUser();
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
    if (error) {
      navigate(`/login?error=${error}`);
    } else {
      if (token) {
        setUser(token);
      }
      navigateToRequestedUrl();
    }
  }, [token, error]);

  return (
    <div>
      <p>Redirecting user ...</p>
    </div>
  );
}
