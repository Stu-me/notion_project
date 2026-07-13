import { Navigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({children}) =>{
    const {user,loading} = useAuth(); // get the auth state from the context 
    // we did not use token cause in auth context we already checked the token and then we move into protectedroute
    if(loading === true){
        return(
            <h1>Loading............</h1>
        )
    }
    if(!user){
        return <Navigate to='/login' replace /> // replace so that user is not 
        // forced to login again 
    }
    return children
}

export default ProtectedRoute
