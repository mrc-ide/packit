import { SlidersVertical } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@components/Base/Accordion";
import { ParameterContainer } from "../common/ParameterContainer";

interface PacketParametersProps {
  parameters: Record<string, string>;
}
export const PacketParameters = ({ parameters }: PacketParametersProps) => {
  return (
    <AccordionItem value="parameters">
      <AccordionTrigger>
        <span className="flex gap-1 items-center">
          <SlidersVertical className="small-icon text-muted-foreground" />
          <h3>Parameters</h3>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-wrap gap-1">
          {Object.keys(parameters)?.length === 0 ? (
            <div className="italic text-sm">None</div>
          ) : (
            Object.entries(parameters).map(([key, val]) => (
              <ParameterContainer key={key} paramKey={key} paramValue={val} />
            ))
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
