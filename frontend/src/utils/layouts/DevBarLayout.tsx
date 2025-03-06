import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Outlet } from "react-router-dom";
import { useApi } from "../api";

const schema = z.object({
  userId: z.string().nonempty(),
});

type FormData = z.infer<typeof schema>;

export const DevBarLayout: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const api = useApi();

  const onSubmit = async (data: FormData) => {
    const userId = parseInt(data.userId);
    try {
      const res = await api.Auth.authControllerDevLogin({ userId });
      console.log(res);
      localStorage.setItem("access_token", res.accessToken);
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <div className="backdrop-blur-sm flex justify-between items-center gap-4 sticky top-0 z-10 p-4 bg-orange-400 bg-opacity-20">
        <h1>DevBar</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full max-w-sm items-center space-x-2"
        >
          <Input type="number" placeholder="user id" {...register("userId")} />
          {errors.userId && <span>{errors.userId.message}</span>}
          <Button type="submit">switch</Button>
        </form>
      </div>
      <Outlet />
    </div>
  );
};
