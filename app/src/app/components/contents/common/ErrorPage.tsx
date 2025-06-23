import { ErrorComponent, ErrorProps } from "./ErrorComponent";

export const ErrorPage = ({ error, message }: ErrorProps) => (
  <div className="container h-[800px] flex items-center justify-center m-auto">
    <ErrorComponent error={error} message={message} />
  </div>
);
