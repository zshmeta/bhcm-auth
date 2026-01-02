import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@repo/ui";
import { useAuth, type User } from "./AuthContext";

export interface UserOrLoginProps {
  loginTo?: string;
  loginLabel?: string;
  renderUser?: (user: User) => React.ReactNode;
}

export const UserOrLogin: React.FC<UserOrLoginProps> = ({
  loginTo = "/auth",
  loginLabel = "Log in",
  renderUser,
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return null;

  if (!user) {
    return (
      <Button type="button" onClick={() => navigate(loginTo)}>
        {loginLabel}
      </Button>
    );
  }

  return <>{renderUser ? renderUser(user) : <span>{user.email}</span>}</>;
};
