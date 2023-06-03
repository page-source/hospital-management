import { createContext, useContext } from "react";

const UserContext = createContext<any>({});

export const UserProvider = UserContext.Provider;

export const useUserContext = () => {
  const { userDetails, setUserDetails } = useContext(UserContext);
  return [userDetails, setUserDetails];
};
