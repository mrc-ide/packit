import React from "react";
import {NavDropdown} from "react-bootstrap";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

export default function HeaderDropDown() {
    return (
        <NavDropdown data-testid="drop-down" className="icon-primary" title={
            <AccountCircleIcon sx={{fontSize: 35}}/>}>
            <NavDropdown.Item>l.ani@imperial.ac.uk</NavDropdown.Item>
            <NavDropdown.Item>Manage access</NavDropdown.Item>
            <NavDropdown.Item>Publish packets</NavDropdown.Item>
            <NavDropdown.Divider></NavDropdown.Divider>
            <NavDropdown.Item>
                <LogoutIcon className="me-2" sx={{fontSize: 20}}/>
                Logout
            </NavDropdown.Item>
        </NavDropdown>
    );
}
