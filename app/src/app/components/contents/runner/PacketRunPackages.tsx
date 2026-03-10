import { Library } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@components/Base/Accordion";
import { useGetPackages } from "./hooks/useGetPackages";
import { Skeleton } from "@components/Base/Skeleton";

export const PacketRunPackages = () => {
  const { packages, isLoading, error } = useGetPackages();

  if (isLoading) {
    return <Skeleton className="w-full h-32" />;
  }

  if (error) {
    return (
      <div className="w-full p-4 text-sm text-red-600">
        Failed to load packages.
      </div>
    );
  }

  if (!packages) {
    return null;
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Packages</h2>
        <p className="text-muted-foreground">Manage R packages installed globally on the runner</p>
      </div>
      <div className="space-y-4 flex flex-col mt-4 items-start w-full">
        <Accordion type="single" collapsible defaultValue="installed" className="w-full">
          <AccordionItem value="installed">
            <AccordionTrigger>
              <span className="flex gap-1 items-center">
                <Library className="small-icon text-muted-foreground" />
                <h3>Installed packages ({packages.length})</h3>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 overflow-y-auto" style={{ maxHeight: "1000px" }}>
                {packages.map((pkg) => (
                  <li key={pkg.name}>
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
