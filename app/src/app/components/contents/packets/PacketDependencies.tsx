import { ListTree } from "lucide-react";
import { PacketDepends } from "../../../../types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../Base/Accordion";
import { PacketDependency } from "./PacketDependency";

interface PacketDependenciesProps {
  depends: PacketDepends[];
}
export const PacketDependencies = ({ depends }: PacketDependenciesProps) => {
  return (
    <div>
      <AccordionItem value="dependencies">
        <AccordionTrigger>
          <span className="flex gap-1 items-center">
            <ListTree className="small-icon text-muted-foreground" />
            <h3>Dependencies</h3>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-1 overflow-y-auto max-h-80">
            {depends.length === 0 ? (
              <div className="italic text-sm">This packet has no dependencies on other packets</div>
            ) : (
              depends.map((dependency) => <PacketDependency key={dependency.packet} dependency={dependency} />)
            )}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
