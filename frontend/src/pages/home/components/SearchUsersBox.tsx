"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import debounce from "lodash/debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SearchUserResponseDto } from "@/generated-api";
import { useApi } from "@/utils/api";
import { useNavigate } from "react-router-dom";
import AvatarDisplay from "@/pages/updateUser/components/AvatarDisplay";

export default function SearchUsersBox() {
  const { register, watch } = useForm<{ search: string }>({
    defaultValues: { search: "" },
  });
  const [users, setUsers] = useState<Array<SearchUserResponseDto>>([]);
  const [loading, setLoading] = useState(false);
  const api = useApi();
  const navigate = useNavigate();

  const fetchUsers = async (query: string) => {
    if (!query) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.Users.usersControllerSearch({
        body: { query },
      });
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of the fetchUsers function
  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 300), []);

  // Watch for changes in the search input and trigger the debounced fetch
  const searchValue = watch("search");
  useEffect(() => {
    debouncedFetchUsers(searchValue);
  }, [searchValue, debouncedFetchUsers]);

  return (
    <Card className="w-full">
      <CardHeader>
        <Input placeholder="Search name or email..." {...register("search")} />
      </CardHeader>
      {searchValue && (
        <CardContent className="flex flex-col gap-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            users.map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between gap-4 border p-3 rounded-md"
              >
                <div className="flex items-center space-x-4">
                  <AvatarDisplay avatarUrl={user.avatar} />
                  <div>
                    <p className="text-sm font-medium">{user.nickname}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    View
                  </Button>
                  <Button size="sm">Friend Request</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      )}
    </Card>
  );
}
