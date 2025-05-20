import { ListTree } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../Base/Accordion";
import { Link, useParams } from "react-router-dom";
import { useGetPacketDependencies } from "./hooks/useGetPacketDependencies";

export const PacketDependencies = () => {
  const { packetId } = useParams();
  const { dependencies } = useGetPacketDependencies(packetId);

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
            {dependencies && dependencies.length === 0 ? (
              <div className="italic text-sm">This packet has no dependencies on other packets</div>
            ) : (
              dependencies?.map((dependency) => (
                <li key={dependency.id}>
                  <span className="font-semibold mr-2">{dependency.name}</span>
                  <Link
                    to={`/${dependency.name}/${dependency.id}`}
                    className="hover:underline decoration-blue-500 text-sm font-semibold text-blue-500"
                  >
                    {dependency.id}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
