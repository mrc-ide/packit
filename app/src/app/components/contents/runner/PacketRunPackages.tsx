import { Library } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@components/Base/Accordion";
import { useGetPackages } from "./hooks/useGetPackages";

export const PacketRunPackages = () => {
  const { packages, error, isLoading, mutate } = useGetPackages();

  console.log("Packages:", packages, "Loading:", isLoading, "Error:", error);

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Packages</h2>
        <p className="text-muted-foreground">Manage packages installed globally on the runner</p>
      </div>
      <div className="space-y-4 flex flex-col mt-4 items-start w-full">
        <Accordion type="single" collapsible defaultValue="installed" className="w-full">
          <AccordionItem value="installed">
            <AccordionTrigger>
              <span className="flex gap-1 items-center">
                <Library className="small-icon text-muted-foreground" />
                <h3>Installed packages</h3>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 overflow-y-auto" style={ { maxHeight: "1000px" } }>
                {packages.map((pkg, index) => (
                  <li key={index}>
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
