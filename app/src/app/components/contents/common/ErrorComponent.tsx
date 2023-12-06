import { useEffect } from "react";

interface ErrorProps {
  message: string;
  error: Error;
}
export const ErrorComponent = ({ message, error }: ErrorProps) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  return (
    <div className="flex border rounded-md p-6 justify-center text-red-500 flex-col items-center">
      <h3 className="scroll-m-20 text-lg font-semibold tracking-tight">{message}</h3>
      <p className="italic">Please try again later. If the problem persists, contact RSE team.</p>
    </div>
  );
};
