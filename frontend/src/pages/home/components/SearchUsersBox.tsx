"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const mockUsers = [
  // {
  //   name: "Olivia Martin",
  //   email: "m@example.com",
  //   avatar: "/avatars/03.png",
  // },
  // {
  //   name: "Isabella Nguyen",
  //   email: "b@example.com",
  //   avatar: "/avatars/05.png",
  // },
  // {
  //   name: "Sofia Davis",
  //   email: "p@example.com",
  //   avatar: "/avatars/01.png",
  // },
  // {
  //   name: "Daniel Stone",
  //   email: "daniel@example.com",
  //   avatar: "/avatars/02.png",
  // },
];

export default function SearchUsersBox() {
  const [search, setSearch] = useState("");

  const filteredUsers = mockUsers.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <Input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.name}
              className="flex items-center justify-between gap-4 border p-3 rounded-md"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View
                </Button>
                <Button size="sm">Friend Request</Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
