import { useParams } from "react-router-dom";

export const PacketRunTaskLogs = () => {
  const { taskId } = useParams();
  return <div>PacketRunTaskLogs: taskId: {taskId}</div>;
};
