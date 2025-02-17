import React, { useEffect, useState } from "react";
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
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";

const FormSchema = z.object({
  code: z
    .string()
    .length(6, { message: "Your one-time password must be 6 digits." })
    .regex(/^[0-9]{6}$/, {
      message: "Your one-time password must contain only digits.",
    }),
});

const TwoFactorAuth = () => {
  const [qr, setQr] = useState("");
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const response = await axios.get(
          "https://localhost:3000/2fa/generate",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            responseType: "blob",
          },
        );

        const reader = new FileReader();
        reader.onload = () => {
          setQr(reader.result as string);
        };
        reader.readAsDataURL(response.data);
      } catch (error) {
        console.error("Failed to generate 2FA QR code:", error);
      }
    };
    generateQRCode();
  }, []);

  const onSubmit = async (data: { code: string }) => {
    try {
      const response = await axios.post(
        "https://localhost:3000/2fa/turn-on",
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
        localStorage.setItem("access_token", response.data.accessToken);
        navigate("/update");
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <img src={qr} alt="2FA QR Code" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="items-center text-center"
        >
          <FormField
            control={form.control}
            name="code"
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
                  Please enter the one-time password sent to your phone.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-3">
            Send Code
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default TwoFactorAuth;
