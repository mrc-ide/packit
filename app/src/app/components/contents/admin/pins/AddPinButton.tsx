import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@components/Base/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/Base/Dialog";
import { AddPinForm } from "./AddPinForm";
import { PacketMetadata } from "@/types";
import { KeyedMutator } from "swr";

interface AddPinButtonProps {
  mutate: KeyedMutator<PacketMetadata[]>;
}
export const AddPinButton = ({ mutate }: AddPinButtonProps) => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <Dialog open={formOpen} onOpenChange={setFormOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <SquarePlus className="mr-2 h-5 w-5" />
          Add pin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Pin a packet</DialogTitle>
        </DialogHeader>
        <AddPinForm setFormOpen={setFormOpen} mutate={mutate} formOpen={formOpen} />
      </DialogContent>
    </Dialog>
  );
};
