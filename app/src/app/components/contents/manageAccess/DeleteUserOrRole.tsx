import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "../../Base/AlertDialog";
import { Button, buttonVariants } from "../../Base/Button";
import { RoleWithRelationships } from "./types/RoleWithRelationships";
import { KeyedMutator } from "swr";
import { fetcher } from "../../../../lib/fetch";
import appConfig from "../../../../config/appConfig";

interface DeleteUserOrRoleProps {
  mutate: KeyedMutator<RoleWithRelationships[]>;
  data: {
    name: string;
    type: "user" | "role";
  };
}
export const DeleteUserOrRole = ({ mutate, data: { name, type } }: DeleteUserOrRoleProps) => {
  const onDelete = async (roleName: string) => {
    try {
      const endpoint = type === "role" ? "roles" : type;
      await fetcher({
        url: `${appConfig.apiUrl()}/${endpoint}/${roleName}`,
        method: "DELETE"
      });
      mutate();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={`delete-${type}`}
          className="hover:bg-red-100 dark:hover:bg-red-950"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure you want to delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You are about to permanently delete a {type},{" "}
            {type === "role"
              ? "this will affect all users that have this role and they will lose their associated permissions."
              : "they will lose access to the application and lose all related data."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button className={buttonVariants({ variant: "destructive" })} onClick={() => onDelete(name)}>
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
