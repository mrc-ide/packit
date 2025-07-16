import { PinOffIcon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/Base/Dialog";
import { DeletePinForm } from "./DeletePinForm";
import { PacketMetadata } from "@/types";
import { KeyedMutator } from "swr";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";

interface DeletePinButtonProps {
  packet: PacketMetadata;
  mutate: KeyedMutator<PacketMetadata[]>;
}
export const DeletePinButton = ({ packet, mutate }: DeletePinButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PinOffIcon
                data-testid="unpinButton"
                size={20}
                className="cursor-pointer stroke-red-500 opacity-75 hover:opacity-100"
              />
            </TooltipTrigger>
            <TooltipContent>Remove pin from this packet</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Confirm removing pin</DialogTitle>
        </DialogHeader>
        <DeletePinForm packet={packet} setOpen={setOpen} mutate={mutate} />
      </DialogContent>
    </Dialog>
  );
};
