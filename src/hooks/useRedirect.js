import { useNavigate } from "react-router-dom"

const useRedirect = (to, message) => {
    const navigate = useNavigate();

    const redirect = () => {
        navigate(to, { state: { message } });
    }

    return redirect;
}

export default useRedirect;