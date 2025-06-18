import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {useForm} from "react-hook-form";
import { REGEXP_ONLY_CHARS } from "input-otp";
import {fetcher} from "../../../lib/fetch";
import appConfig from "../../../config/appConfig";
import {ApiError} from "../../../lib/errors";
import {HttpStatus} from "../../../lib/types/HttpStatus";
import {Button} from "../Base/Button";
import {Form, FormControl, FormField, FormItem} from "../Base/Form";
import {InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator} from "../Base/InputOTP";

export const DeviceActivation = () => {
    const [fetchError, setFetchError] = useState("");
    const [success, setSuccess] = useState(false);
    const formSchema = z.object({
        user_code: z
            .string()
            .toUpperCase()
            .regex(
                /^[A-Z]{8}$/,
                "Unexpected user code format"
            )
            .transform((val) => `${val.slice(0, 4)}-${val.slice(4)}`) // inject hyphen into the right position
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { user_code: "" }
    });
    const url = `${appConfig.apiUrl()}/deviceAuth/validate`;
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log("values are " + JSON.stringify(values))
        try {
            await fetcher({
                url,
                method: "POST",
                body: values
            });
            setSuccess(true);
        } catch (error) {
            if (error instanceof ApiError && error.status === HttpStatus.BadRequest) {
               setFetchError("Code has expired or is not recognised.");
            } else {
                setFetchError("An unexpected error occurred.");
            }
        }
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                <FormField control={form.control} name="user_code" render={({ field }) => (
                    <FormItem>
                         <FormControl>
                            <InputOTP {...field}
                                autoFocus={true}
                                maxLength={8}
                                pattern={REGEXP_ONLY_CHARS}
                                pasteTransformer={(pasted: string) => pasted.replaceAll("-", "")}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                                <InputOTPSlot index={6} />
                                <InputOTPSlot index={7} />
                            </InputOTPGroup>
                        </InputOTP>
                        </FormControl>
                    </FormItem>
                )}/>
                <Button type="submit" disabled={!form.formState.isValid}>Continue</Button>
            </form>
            {success}{fetchError}
        </Form>

    );
}
