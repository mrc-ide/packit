import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../providers/UserProvider";

export default function Redirect() {
  const navigate = useNavigate();
  const { user, setUser, requestedUrl, setRequestedUrl } = useUser();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const navigateToRequestedUrl  = () => {


    //console.log(`Requested Url in Redirect is ${requestedUrl}`);
    //console.log(`Direct requested url in Redirect is ${sessionStorage.getItem("requestedUrlDirect")}`)
    const url = requestedUrl || "/";

    // reset requested url first
    //console.log("Setting requested url to null")
    setRequestedUrl(null);

    //console.log(`Doing redirect to ${url}`)
    navigate(url);
  };

  useEffect(() => {
    if (user?.token) {
      navigateToRequestedUrl();
    } else if (token) {
      setUser(token);
      //navigateToRequestedUrl();
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
