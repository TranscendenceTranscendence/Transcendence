import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="p-8 text-center border-none shadow-none">
        <CardContent>
          <p
            className={cn(
              "text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-orange-500 to-teal-400 bg-clip-text text-transparent animate-gradient"
            )}
          >
            Transcendence
          </p>
          <Button
            className="transition-transform duration-300 hover:scale-110 mb-4 rounded-md"
            asChild
            size="lg"
          >
            <a href="https://localhost:3000/auth/42/login">
              Login with 42.intra
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
