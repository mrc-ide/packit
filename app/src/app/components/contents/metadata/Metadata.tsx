import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getDateUTCString, getElapsedTime } from "../../../../helpers";
import { RootState, useAppDispatch } from "../../../../types";
import { actions } from "../../../store/packets/packetThunks";
import { PacketHeader } from "../packets";

export default function Metadata() {
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
      <div className="w-75">
        <ul className="list-group">
          <li className="list-group-item d-flex flex-wrap justify-content-between">
            {getDateUTCString(packet.time) && (
              <div className="col-md-6 p-2 justify-content-start d-flex">
                <span className="p-2 fw-semibold">Started:</span>
                <span className="p-2 text-muted">{getDateUTCString(packet.time)}</span>
              </div>
            )}
            {getElapsedTime(packet.time) && (
              <div data-testid="elapsed" className="col-md-6 p-2 d-flex">
                <span className="p-2 fw-semibold">Elapsed:</span>
                <span className="p-2 text-muted">{getElapsedTime(packet.time)}</span>
              </div>
            )}
          </li>
          <li className="list-group-item d-flex flex-wrap justify-content-between">
            {packet.git?.branch && (
              <div data-testid="git-branch" className="p-2 justify-content-start d-flex">
                <span className="fw-semibold p-2">Git Branch:</span>
                <span className="p-2 text-muted">{packet.git?.branch}</span>
              </div>
            )}
            {packet.git?.sha && (
              <div data-testid="git-sha" className="p-2 d-flex">
                <span className="p-2 fw-semibold">Git Commit:</span>
                <span className="p-2 text-muted">{packet.git?.sha}</span>
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
