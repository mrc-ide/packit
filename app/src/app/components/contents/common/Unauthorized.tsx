export const Unauthorized = () => {
  return (
    <div className="container h-[800px] flex items-center justify-center m-auto">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-red-500">401 Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    </div>
  );
};
