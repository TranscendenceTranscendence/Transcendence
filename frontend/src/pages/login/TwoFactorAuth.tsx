import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "../../components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../../components/ui/input-otp";

const FormSchema = z.object({
  pin: z
    .string()
    .length(6, { message: "Your one-time password must be 6 digits." })
    .regex(/^[0-9]{6}$/, {
      message: "Your one-time password must contain only digits.",
    }),
});

const TwoFactorAuthForm = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: "" },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await axios.post(
        "https://localhost:3000/2fa/authenticate",
        { twoFactorAuthenticationCode: data.pin },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        const responseData = response.data;
        if (responseData.msg === "Authenticated successfully") {
          localStorage.setItem("access_token", responseData.accessToken);
          setSuccess("2FA authentication successful!");
          setError("");
          navigate("/");
        } else {
          throw new Error("Network response was not ok");
        }
      }
    } catch (error) {
      console.error("Error authenticating 2FA code:", error);
      setError("An error occurred. Please try again.");
      setSuccess("");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">
        Google Two-Factor Authentication
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center"
        >
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                  Please enter the one-time password from your Google
                  Authenticator app.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <br />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-500 mt-2">{success}</div>}
    </div>
  );
};

export default TwoFactorAuthForm;
