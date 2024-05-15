import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../Base/Form";
import { Input } from "../Base/Input";
import { Button } from "../Base/Button";
import appConfig from "../../../config/appConfig";
import { fetcher } from "../../../lib/fetch";
import { ApiError } from "../../../lib/errors";

export const UpdatePassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fetchError, setFetchError] = useState<string>();
  const email = searchParams.get("email") || "";
  const resetPasswordError = searchParams.get("error") || "";

  const formSchema = z
    .object({
      currentPassword: z.string().min(8),
      newPassword: z.string().min(8),
      confirmPassword: z.string().min(8)
    })
    .refine((data) => data.confirmPassword === data.newPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"]
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "New password must be different from current password",
      path: ["newPassword"]
    });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async ({ currentPassword, newPassword }: z.infer<typeof formSchema>) => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/auth/${email}/basic/password`,
        body: { currentPassword, newPassword },
        method: "POST",
        noAuth: true
      });
      navigate("/login");
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError && error.status === 400) {
        form.setError("currentPassword", { message: error.message });
        return;
      }
      setFetchError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container h-[800px] flex items-center justify-center m-auto">
      <div className="md:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Update your password</h1>
            {resetPasswordError && <div className="text-xs text-red-500">{resetPasswordError}</div>}
          </div>
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
                        <Input type="password" autoComplete="current-password" {...field} />
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
                        <Input type="password" autoComplete="current-password" {...field} />
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
                        <Input type="password" autoComplete="current-password" {...field} />
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
        </div>
      </div>
    </div>
  );
};
