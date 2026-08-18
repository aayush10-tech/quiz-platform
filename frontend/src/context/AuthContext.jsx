import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const AuthContext = createContext();

const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://quiz-platform-i3oc.onrender.com/api";

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const initializeAuth = async () => {

            const storedToken =
                sessionStorage.getItem("token");

            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {

                const response = await fetch(
                    `${API_URL}/auth/profile`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${storedToken}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error("Invalid session");
                }

                setToken(storedToken);
                setUser(data.user);

                sessionStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

            } catch (error) {

                console.error(
                    "Session validation failed:",
                    error
                );

                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");

                setToken(null);
                setUser(null);

            } finally {

                setLoading(false);

            }

        };

        initializeAuth();

    }, []);


    const login = (jwtToken, userData) => {

        sessionStorage.setItem(
            "token",
            jwtToken
        );

        sessionStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setToken(jwtToken);
        setUser(userData);

    };


    const logout = () => {

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        setToken(null);
        setUser(null);

    };


    return (

        <AuthContext.Provider
            value={{

                user,

                token,

                loading,

                login,

                logout,

                isAuthenticated: !!token,

                isAdmin:
                    user?.role === "ADMIN",

                isStudent:
                    user?.role === "STUDENT"

            }}
        >

            {children}

        </AuthContext.Provider>

    );

};


export const useAuth = () => {

    return useContext(AuthContext);

};