import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../providers/UserProvider";

export default function Redirect() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  useEffect(() => {
    if (user?.token) {
      navigate("/");
    }
    if (token) {
      setUser({ token });
      navigate("/");
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
