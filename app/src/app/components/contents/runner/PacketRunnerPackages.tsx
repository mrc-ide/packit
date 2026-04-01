import { useGetPackages } from "./hooks/useGetPackages";
import { Skeleton } from "@components/Base/Skeleton";
import { HttpStatus } from "@lib/types/HttpStatus";
import { Unauthorized } from "../common/Unauthorized";
import { ErrorComponent } from "../common/ErrorComponent";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@components/Base/Accordion";

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

  const sharedLibraryPackages = packages.filter((pkg) => pkg.location === "/library");
  const otherPackages = packages.filter((pkg) => pkg.location !== "/library");

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Package versions</h2>
        <p className="text-muted-foreground">View installed R packages and versions</p>
      </div>
      <div className="space-y-4 mt-4">
        <Accordion type="single" collapsible defaultValue="library" className="w-full">
          <AccordionItem value="library">
            <AccordionTrigger>
              <h3>Runner packages</h3>
            </AccordionTrigger>
            <AccordionContent>
              <p>
                This list includes only the additional packages installed in the runner&rsquo;s R library for use by
                reports.
              </p>
              <ul className="space-y-1 mt-4 overflow-y-auto" style={{ maxHeight: "1000px" }}>
                {sharedLibraryPackages.map((pkg, name) => (
                  <li key={name}>
                    <span className="font-semibold mr-2">{pkg.name}</span>
                    <span className="text-muted-foreground">{pkg.version}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="other">
            <AccordionTrigger>
              <h3>Other packages</h3>
            </AccordionTrigger>
            <AccordionContent>
              <p>
                This list includes packages that are part of the base R installation, or which are available in the
                runner environment without having been specifically installed in the runner&rsquo;s R library. They are
                included here for reference. It is recommended to specifically install any packages your reports depend
                on in the runner&rsquo;s R library to ensure consistent behavior across different environments.
              </p>
              <ul className="space-y-1 mt-4 overflow-y-auto" style={{ maxHeight: "1000px" }}>
                {otherPackages.map((pkg, name) => (
                  <li key={name}>
                    <span className="font-semibold mr-2">{pkg.name}</span>
                    <span className="text-muted-foreground">{pkg.version}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
};
