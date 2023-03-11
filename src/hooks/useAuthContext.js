import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const useAuthContext = () => {
    const auth = useContext(AuthContext);
    return auth;
};

export default useAuthContext;