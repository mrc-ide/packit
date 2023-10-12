import React from "react";
import {NavDropdown} from "react-bootstrap";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import {useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../../../types";
import {logout} from "../../store/login/login";
import {useNavigate} from "react-router-dom";

export default function HeaderDropDown() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {isAuthenticated, user} = useSelector((state: RootState) => state.login);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <>
            {isAuthenticated &&
                <NavDropdown data-testid="drop-down" className="icon-primary" title={
                    <AccountCircleIcon sx={{fontSize: 35}}/>}>
                    <NavDropdown.Item>{user.email} </NavDropdown.Item>
                    <NavDropdown.Item>Manage access</NavDropdown.Item>
                    <NavDropdown.Item>Publish packets</NavDropdown.Item>
                    <NavDropdown.Divider></NavDropdown.Divider>
                    <NavDropdown.Item onClick={handleLogout}>
                        <LogoutIcon className="me-2" sx={{fontSize: 20}}/>
                        Logout
                    </NavDropdown.Item>
                </NavDropdown>
            }
        </>
    );
}
