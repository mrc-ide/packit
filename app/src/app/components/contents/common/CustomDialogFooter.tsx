import { Button } from "../../Base/Button";
import { DialogClose, DialogFooter } from "../../Base/Dialog";

interface CustomDialogFooterProps {
  error?: string;
  onCancel: () => void;
  submitText: string;
}
export const CustomDialogFooter = ({ error, onCancel, submitText }: CustomDialogFooterProps) => {
  return (
    <DialogFooter className="sm:justify-end gap-1">
      {error && <div className="text-xs text-red-500">{error}</div>}
      <DialogClose asChild>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </DialogClose>
      <Button type="submit">{submitText}</Button>
    </DialogFooter>
  );
};
