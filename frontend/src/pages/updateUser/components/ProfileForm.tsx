import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "../../../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { UpdateUserDto } from "../../../generated-api";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const profileSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  twoFactorEnabled: z.boolean(),
  avatar: z.string().optional(),
});

interface ProfileFormProps {
  onSend: (data: UpdateUserDto) => void;
}

export default function ProfileForm({ onSend }: ProfileFormProps) {
  const api = useApi();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const fetched = React.useRef(false);

  const form = useForm<UpdateUserDto>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: "",
      twoFactorEnabled: false,
      avatar: "",
    },
  });

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    api.Users.usersControllerMe()
      .then((response) => {
        form.setValue("nickname", response.nickname);
        form.setValue("twoFactorEnabled", response.twoFactorEnabled);
        form.setValue("avatar", response.avatar);
        onSend({
          nickname: response.nickname,
          twoFactorEnabled: response.twoFactorEnabled,
          avatar: response.avatar,
        });
      })
      .catch(console.error);
  }, [api.Users, form, onSend]);

  const handleCheckboxChange = async (checked: boolean) => {
    navigate(checked ? "/2fa/turn-on" : "/2fa/turn-off");
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files?.length) return;
      const file: File = event.target.files[0];
      try {
        const response: { filePath: string } =
          await api.FileUpload.fileUploadControllerUploadFile({
            file,
            filename: file.name,
            category: "avatar",
          });
        form.setValue("avatar", response.filePath);
      } catch (error) {
        console.error(error);
      }
    },
    [api, form],
  );

  const onFormSubmit = useCallback(
    async (data: UpdateUserDto) => {
      setIsSaving(true);
      try {
        const response = await api.Users.usersControllerUpdate({
          updateUserDto: data,
        });

        if (response.success) {
          onSend(data);
          toast.success("Profile updated successfully!");
        } else {
          if ("global" in response.errors)
            toast.error(
              typeof response.errors.global === "string"
                ? response.errors.global
                : "An error occurred",
            );
          else {
            const fields = form.getValues();
            for (const field in fields) {
              if (field in response.errors) {
                form.setError(field as keyof UpdateUserDto, {
                  type: "server",
                  message: response.errors[field],
                });
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to update profile.");
      } finally {
        setIsSaving(false);
      }
    },
    [api, onSend],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Welcome!</CardTitle>
            <CardDescription>
              Update your profile information here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>
                {form.getValues("avatar") ? "Change avatar" : "Upload avatar"}
              </FormLabel>
              <FormControl>
                <Input
                  id="picture"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </FormControl>
            </FormItem>

            <FormField
              control={form.control}
              name="twoFactorEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        handleCheckboxChange(!!checked);
                        field.onChange(checked);
                      }}
                    />
                  </FormControl>
                  <FormLabel>Enable Two-Factor Authentication</FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Submit"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
