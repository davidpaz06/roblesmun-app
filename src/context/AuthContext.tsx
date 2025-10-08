import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type FC,
} from "react";
import type { User } from "../interfaces/User";
import type { FacultyCode } from "../interfaces/FacultyCode";
import type { RegisterData } from "../interfaces/RegisterData";
import type { LoginData } from "../interfaces/LoginData";

import { FirestoreService } from "../firebase/firestore";
import { AuthService } from "../firebase/auth";
import { where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: LoginData) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  checkFacultyCode: (userData: RegisterData) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    AuthService.getCurrentUser().then(async (firebaseUser) => {
      if (firebaseUser) {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const results = await FirestoreService.getAll<User>("users", [
              where("id", "==", user.uid),
            ]);
            setUser(results[0] || null);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (userData: LoginData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const user = await AuthService.login(userData.email, userData.password);
      if (!user) throw new Error("User does not exist");

      const results = await FirestoreService.getAll<User>("users", [
        where("id", "==", user.uid),
      ]);
      if (results.length === 0)
        throw new Error("No user profile found in database");

      const token = await user.getIdToken();
      localStorage.setItem("authToken", token);

      setUser(results[0]);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    console.log("Registering user:", userData);
    try {
      const isFaculty = await checkFacultyCode(userData);

      const userExists = await FirestoreService.getAll<User>("users", [
        where("email", "==", userData.email),
      ]);
      if (userExists.length > 0) {
        throw new Error("User with this email already exists");
      }

      const firebaseUser = await AuthService.register(
        userData.email,
        userData.password
      );

      await FirestoreService.add<User>("users", {
        id: firebaseUser.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        institution: userData.institution || "",
        isFaculty,
        isAdmin: false,
      });

      await login({ email: userData.email, password: userData.password });

      return true;
    } catch (error) {
      console.error("Register error:", error);
      throw new Error("Error registering user: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFacultyCode = async (userData: RegisterData): Promise<boolean> => {
    try {
      const results = await FirestoreService.getAll<FacultyCode>(
        "facultyCodes",
        [where("institution", "==", userData.institution)]
      );
      if (
        results.length > 0 &&
        results[0].facultyCode === userData.facultyCode
      ) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking faculty code:", error);
      throw new Error(
        "Error checking faculty code: " + (error as Error).message
      );
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("rememberMe");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Error logging out: " + (error as Error).message);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    checkFacultyCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
