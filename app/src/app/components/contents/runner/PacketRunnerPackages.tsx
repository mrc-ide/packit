import { Library } from "lucide-react";
import { useGetPackages } from "./hooks/useGetPackages";
import { Skeleton } from "@components/Base/Skeleton";
import { HttpStatus } from "@lib/types/HttpStatus";
import { Unauthorized } from "../common/Unauthorized";
import { ErrorComponent } from "../common/ErrorComponent";

export const PacketRunnerPackages = () => {
  const { packages, error } = useGetPackages();

  if (error) {
    if (error.status === HttpStatus.Unauthorized) {
      return <Unauthorized />;
    }
    return <ErrorComponent message="Error fetching data" error={error} />;
  }

  if (!packages) {
    return <Skeleton className="w-full h-32" />;
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Package versions</h2>
        <p className="text-muted-foreground">View installed R packages and versions</p>
      </div>
      <div className="space-y-4 mt-4">
        <p>
          This list includes only the additional packages installed in the runner&rsquo;s R library for use by reports,
          and excludes some standard packages.
        </p>
        <span className="flex gap-1 items-center">
          <Library className="small-icon text-muted-foreground" />
          <h3 className="text-lg">Installed packages</h3>
        </span>
        <ul className="space-y-1">
          {packages.map((pkg, name) => (
            <li key={name}>
              <span className="font-semibold mr-2">{pkg.name}</span>
              <span className="text-muted-foreground">{pkg.version}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
