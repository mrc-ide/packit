import { Button, buttonVariants } from "../../Base/Button";
import { DialogClose, DialogFooter } from "@components/Base/Dialog";
import type { VariantProps } from "class-variance-authority";

interface CustomDialogFooterProps {
  error?: string;
  onCancel: () => void;
  submitText: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}
export const CustomDialogFooter = ({ error, onCancel, submitText, variant = "default" }: CustomDialogFooterProps) => {
  return (
    <DialogFooter className="sm:justify-end gap-1">
      {error && <div className="text-xs text-red-500">{error}</div>}
      <DialogClose asChild>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </DialogClose>
      <Button type="submit" variant={variant}>
        {submitText}
      </Button>
    </DialogFooter>
  );
};
