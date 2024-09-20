interface ParameterContainerProps {
  paramKey: string;
  paramValue: string | boolean | number;
}
export const ParameterContainer = ({ paramKey, paramValue }: ParameterContainerProps) => {
  return (
    <div className="border py-0.5 px-1.5 rounded-md flex space-x-1 text-xs">
      <div>{paramKey}: </div>
      <div className="text-muted-foreground"> {paramValue.toString()}</div>
    </div>
  );
};
