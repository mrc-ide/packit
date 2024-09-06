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
            <div key={key} className="border p-1 rounded-md flex space-x-1 text-sm">
              <div>{key}: </div>
              <div className="text-muted-foreground"> {String(val)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
