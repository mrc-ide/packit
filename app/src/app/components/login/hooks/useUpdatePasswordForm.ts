import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const useUpdatePasswordForm = () => {
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

  return { form, formSchema };
};
