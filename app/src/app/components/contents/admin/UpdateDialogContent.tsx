import { ReactNode } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "../../Base/Dialog";

interface UpdateDialogContentProps {
  action: "roles" | "permissions" | "users";
  name: string;
  children: ReactNode;
}
export const UpdateDialogContent = ({ action, name, children }: UpdateDialogContentProps) => {
  return (
    <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle>
          Update {action} on {name}
        </DialogTitle>
      </DialogHeader>
      {children}
    </DialogContent>
  );
};
