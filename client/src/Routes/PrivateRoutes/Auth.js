import { AuthContext } from "../../context/Authentication"
import { useContext } from "react"
import PageLogin from "../../pages/login";

export const AuthRoute = function ({ children }) {

    const { userIsAuthenticated } = useContext(AuthContext);

    if (userIsAuthenticated.auth) {
        return { children }
    }
    return <PageLogin />
}