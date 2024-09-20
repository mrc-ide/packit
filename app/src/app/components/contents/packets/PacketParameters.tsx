import { ParameterContainer } from "../common/ParameterContainer";

interface PacketParametersProps {
  parameters: Record<string, string>;
}
export const PacketParameters = ({ parameters }: PacketParametersProps) => {
  return (
    <div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Parameters</h4>
      <div className="flex flex-wrap gap-1">
        {Object.keys(parameters)?.length === 0 ? (
          <div className="italic text-sm">None</div>
        ) : (
          Object.entries(parameters).map(([key, val]) => (
            <ParameterContainer key={key} paramKey={key} paramValue={val} />
          ))
        )}
      </div>
    </div>
  );
};
