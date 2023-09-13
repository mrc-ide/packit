import React from "react";
import {NavDropdown} from "react-bootstrap";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import {useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../../../types";
import {logout} from "../../store/login/login";

export default function HeaderDropDown() {
    const dispatch = useAppDispatch();
    const {isAuthenticated} = useSelector((state: RootState) => state.login);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <>
            {isAuthenticated &&
                <NavDropdown data-testid="drop-down" className="icon-primary" title={
                    <AccountCircleIcon sx={{fontSize: 35}}/>}>
                    <NavDropdown.Item>l.ani@imperial.ac.uk</NavDropdown.Item>
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
