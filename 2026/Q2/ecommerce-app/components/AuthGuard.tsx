import { useAppSelector } from "@/hooks/useRedux";
import type { RootState } from "@/store";
import { Redirect } from "expo-router";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
};

export default AuthGuard;
