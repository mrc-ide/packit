import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import appConfig from "../../../../config/appConfig";
import { RootState, useAppDispatch } from "../../../../types";
import { actions } from "../../../store/packets/packetThunks";
import { PacketFile } from "./PacketFile";
import ParameterList from "./ParameterList";

export default function PacketDetails() {
  const dispatch = useAppDispatch();

  const { packetId } = useParams();

  useEffect(() => {
    if (packetId) {
      dispatch(actions.fetchPacketById(packetId));
    }
  }, [packetId]);

  const { packet, packetError } = useSelector((state: RootState) => state.packets);

  const hasParameters = (): boolean => {
    return Boolean(packet.parameters && Object.keys(packet.parameters).length > 0);
  };

  const hasFiles = (): boolean => {
    return packet.files.length > 0;
  };

  const getHashOfHtmlFile = () => {
    return hasFiles() ? packet.files.find((file) => file.path.split(".").pop() === "html") : null;
  };

  const getHtmlFilePath = () => {
    return getHashOfHtmlFile()
      ? `packets/file/${getHashOfHtmlFile()?.hash}?inline=true&filename=${getHashOfHtmlFile()?.path}`
      : null;
  };

  if (packetError) {
    return <div>{packetError.error.detail}</div>;
  }

  if (!packetError && Object.keys(packet).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div data-testid="packet-runner" className="content packet-details">
      <div className="pb-3 d-flex flex-column align-items-start">
        <span className="p-2 pb-0 h1">{packet.custom?.orderly.description.display || packet.name}</span>
        <span className="p-2 pt-0 small">{packet.id}</span>
        <span className="pt-2">
          <span className="p-2 fw-semibold">Name:</span>
          <span className="p-lg-4">{packet.name}</span>
        </span>
        {hasParameters() && <ParameterList parameters={packet.parameters} />}
      </div>
      {getHtmlFilePath() && (
        <div>
          <div data-testid="runner-content" className="content-box">
            <PacketFile path={getHtmlFilePath()} />
          </div>
          <div data-testid="view-fullscreen" className="p-4 d-flex flex-column align-items-end">
            <a
              className="btn btn-sm rounded"
              target="_blank"
              rel="noreferrer"
              href={`${appConfig.apiUrl()}/${getHtmlFilePath()}`}
            >
              View fullscreen
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
