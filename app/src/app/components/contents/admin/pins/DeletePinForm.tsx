import { Dispatch, SetStateAction, useState } from "react";
import { KeyedMutator } from "swr";
import appConfig from "@config/appConfig";
import { ApiError } from "@lib/errors";
import { fetcher } from "@lib/fetch";
import { HttpStatus } from "@lib/types/HttpStatus";
import { CustomDialogFooter } from "@components/contents/common/CustomDialogFooter";
import { PacketMetadata } from "@/types";

interface DeletePinFormProps {
  packet: PacketMetadata;
  setOpen: Dispatch<SetStateAction<boolean>>;
  mutate: KeyedMutator<PacketMetadata[]>;
}
export const DeletePinForm = ({ packet, mutate, setOpen }: DeletePinFormProps) => {
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/pins`,
        body: { packetId: packet.id },
        method: "DELETE"
      });
      setOpen(false);
      mutate();
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError && error.status === HttpStatus.NotFound) {
        setErrorMessage(error.message);
        return;
      }
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <p>Do you want to remove the pin on &lsquo;{ packet.displayName ?? packet.name }&rsquo;?</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <CustomDialogFooter error={errorMessage} onCancel={() => setOpen(false)} submitText="Yes" />
      </form>
    </div>
  );
};
