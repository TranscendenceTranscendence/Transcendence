import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const FormSchema = z.object({
  code: z
    .string()
    .length(6, { message: "Your one-time password must be 6 digits." })
    .regex(/^[0-9]{6}$/, {
      message: "Your one-time password must contain only digits.",
    }),
});

const DisableTwoFactorAuth = () => {
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "https://f1r3s12:3000/2fa/turn-off",
        {
          twoFactorAuthenticationCode: data.code,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate("/update"), 2000);
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error turning off 2FA:", error);
      form.setError("code", { message: "Invalid code. Please try again." });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">
        Disable Two-Factor Authentication
      </h1>
      {success ? (
        <p className="text-green-600 text-center">
          2FA has been disabled successfully!
        </p>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel>Enter 2FA Code</FormLabel>
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
                    Enter the 6-digit code sent to your phone to disable 2FA.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4">
              Disable 2FA
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default DisableTwoFactorAuth;
