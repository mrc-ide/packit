import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../types";

export const ProtectedRoute = ({element}: any) => {
    const navigate = useNavigate();
    const {isAuthenticated} = useSelector((state: RootState) => state.login);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [navigate]);

    return element;
};
