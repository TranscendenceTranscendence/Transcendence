import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Outlet } from "react-router-dom";
import { useApi } from "../api";
import { jwtDecode } from "jwt-decode";
import { useConfig } from "../config";

const schema = z.object({
  userId: z.string().nonempty(),
});

type FormData = z.infer<typeof schema>;

interface JwtPayload {
  sub: number;
  exp: number;
}

export const DevBarLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = React.useState<number | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const api = useApi();
  const config = useConfig();

  const generateTestUsers = async () => {
    try {
      const results = [];

      for (let i = 1; i <= 100; i++) {
        const userData = {
          avatar: `pingpong.png`,
          nickname: `user${i}`,
          two_factor_enabled: false,
          is_second_auth_done: false,
          two_factor_auth_secret: "",
          email: `user${i}@example.com`,
          elo: Math.floor(Math.random() * 2000 + 250),
          user_status: "offline",
          id: i,
        };

        const response = await fetch(`${config.backendUrl}/users`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        results.push(data);
      }
      alert(`Successfully generated 100 test users!`);
    } catch (error) {
      console.error("Error generating test users:", error);
      alert("Failed to generate test users");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setCurrentUser(decoded.sub);
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem("access_token"); // Remove token if decode fails
      }
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    const userId = parseInt(data.userId);
    try {
      const res = await api.Auth.authControllerDevLogin({ userId });
      localStorage.setItem("access_token", res.accessToken);

      const decoded = jwtDecode<JwtPayload>(res.accessToken);
      setCurrentUser(decoded.sub);

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
          <span className="text-xs text-gray-700">
            User: {currentUser ?? "Not logged in"}
          </span>
          <Input type="number" placeholder="user id" {...register("userId")} />
          {errors.userId && <span>{errors.userId.message}</span>}
          <Button type="submit">switch</Button>
        </form>
        <Button onClick={generateTestUsers}>Generate 100 Users</Button>
      </div>
      <Outlet />
    </div>
  );
};
