import { createContext , useContext , useState , useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [user,setUser] = useState(null);
    const [token,setToken] = useState(null);
    const [loading,setLoading] = useState(true);

    // on app startup — check if token already exists in localStorage
    // if yes — restore the session
    useEffect(()=>{
        const savedUser = localStorage.getItem('user')
        const savedToken = localStorage.getItem('token')

        if(savedToken && savedUser){
            setToken(savedToken);
            setUser(JSON.parse(savedUser)); //localstorage store things in strings so we need to parse before sending or reading 
        }
        setLoading(false) // it should always run 
    },[]);

    const login  = (userData, tokenData) =>{
        setToken(tokenData);    
        setUser(userData);
        localStorage.setItem('token',tokenData);
        localStorage.setItem('user',JSON.stringify(userData)); // stringfy before saving 
    }
    const logout = ()=>{
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';    // redirect to /login
    }
    // this is the xml part 
    return (
        <AuthContext.Provider value={{user , token , login ,logout , loading }}>{children}</AuthContext.Provider>
        // broacasted the value anyone can use them but they need it to get it from useAuth 
    )
}

export const useAuth = ()=> useContext(AuthContext)