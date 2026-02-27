import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@components/Base/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/Base/Dialog";
import { AddPackageForm } from "./AddPackageForm";
import { RunnerPackage } from "@/types";
import { KeyedMutator } from "swr";

interface AddPackageButtonProps {
  mutate: KeyedMutator<RunnerPackage[]>;
}
export const AddPackageButton = ({ mutate }: AddPackageButtonProps) => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <Dialog open={formOpen} onOpenChange={setFormOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <SquarePlus className="mr-2 h-5 w-5" />
          Install a new package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Install a new package</DialogTitle>
        </DialogHeader>
        <AddPackageForm setFormOpen={setFormOpen} mutate={mutate} formOpen={formOpen} />
      </DialogContent>
    </Dialog>
  );
};
