import { useState } from "react";
import { Button } from "../Base/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../Base/Form";
import { Input } from "../Base/Input";
import { useUpdatePasswordForm } from "./hooks/useUpdatePasswordForm";
import { fetcher } from "@lib/fetch";
import appConfig from "@config/appConfig";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@lib/errors";
import { HttpStatus } from "@lib/types/HttpStatus";

interface UpdatePasswordFormProps {
  email: string;
}
export const UpdatePasswordForm = ({ email }: UpdatePasswordFormProps) => {
  const navigate = useNavigate();
  const [fetchError, setFetchError] = useState("");
  const { form, formSchema } = useUpdatePasswordForm();

  const onSubmit = async ({ currentPassword, newPassword }: z.infer<typeof formSchema>) => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/auth/${email}/basic/password`,
        body: { currentPassword, newPassword },
        method: "POST",
        noAuth: true
      });
      navigate(`/login?email=${email}&success=Password updated successfully. Please log in.`);
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError) {
        return error.status === HttpStatus.BadRequest
          ? form.setError("currentPassword", { message: error.message })
          : setFetchError(error.message);
      }
      setFetchError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} autoComplete="current-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} autoComplete="new-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} autoComplete="confirm-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
          {fetchError && <div className="text-xs text-red-500">{fetchError}</div>}
        </form>
      </Form>
    </div>
  );
};
