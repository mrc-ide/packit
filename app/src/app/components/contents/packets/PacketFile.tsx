import {RootState, useAppDispatch} from "../../../../types";
import React, {useEffect} from "react";
import {actions} from "../../../store/packets/thunks";
import {useSelector} from "react-redux";

interface PacketFile {
    hash: string | undefined
}

export function PacketFile({hash}: PacketFile) {

    const dispatch = useAppDispatch();

    const {fileUrl} = useSelector((state: RootState) => state.packets);

    useEffect(() => {
        if (hash) {
            dispatch(actions.fetchFileByHash(hash));
        }
    }, [hash]);

    return (
        <iframe className="packit-iframe" src={fileUrl}></iframe>
    );
}
