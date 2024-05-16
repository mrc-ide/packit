import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import appConfig from "../../../config/appConfig";
import { ApiError } from "../../../lib/errors";
import { fetcher } from "../../../lib/fetch";
import { Button } from "../Base/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../Base/Form";
import { Input } from "../Base/Input";
import { useUser } from "../providers/UserProvider";
import { HttpStatus } from "../../../lib/types/HttpStatus";

export const BasicUserAuthForm = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || "",
      password: ""
    }
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data: { token: string } = await fetcher({
        url: `${appConfig.apiUrl()}/auth/login/basic`,
        body: values,
        method: "POST",
        noAuth: true
      });

      setUser(data.token);
      navigate("/");
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError && error.status === HttpStatus.Unauthorized) {
        if (error.message.includes("must change your password")) {
          return navigate(`/update-password?email=${values.email}&error=${error.message}`);
        }
        form.setError("email", { message: "Invalid email or password" });
        form.setError("password", { message: "Invalid email or password" });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input autoComplete="email" placeholder="m@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          <Mail className="mr-2 h-4 w-4" /> Login with Email
        </Button>
      </form>
    </Form>
  );
};
