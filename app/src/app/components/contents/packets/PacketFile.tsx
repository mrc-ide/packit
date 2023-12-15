import appConfig from "../../../../config/appConfig";

interface PacketFileProps {
  path: string;
}

export function PacketFile({ path }: PacketFileProps) {
  return <iframe className="w-full h-[500px]" src={`${appConfig.apiUrl()}/${path}`}></iframe>;
}
