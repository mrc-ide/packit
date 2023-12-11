import {useEffect, useState} from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FileMetadata, RootState, useAppDispatch } from "../../../../types";
import { actions } from "../../../store/packets/packetThunks";
import { PacketHeader } from "../packets";
import DownloadButton from "./DownloadButton";

export default function Download() {
  const { packet } = useSelector((state: RootState) => state.packets);

  const dispatch = useAppDispatch();

  const { packetId } = useParams();

  useEffect(() => {
    if (packetId) {
      dispatch(actions.fetchPacketById(packetId));
    }
  }, [packetId]);

  if (Object.keys(packet).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="content packet-details">
      <PacketHeader packet={packet} />
      <ul className="list-unstyled">
        {packet.files.map((data, key) => (
          <li key={key} className="pb-2">
            <div className="card custom-card">
              <div className="card-header">Download {data.path}</div>
              <div className="card-body">
                <DownloadButton file={data}></DownloadButton>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
