import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from '../api/axios'

// this is logical or function part 
const LoginPage = ()=>{
    const [formData , setFormData] = useState({email:'',password:''})
    const [error , setError] = useState(null);
    const [loading,setLoading] = useState(false);

    const {login} = useAuth();
    const navigate = useNavigate();

    const handleChange = (e)=>{
        // update formData when user types
        // e.target.name tells you which field changed
        // e.target.value is what they typed
       setFormData({...formData,[e.target.name]: e.target.value })
       // spread the existing data (both email or password) then update the only required field
       // basically saves the values for data that dont change eg to keep password when only email change
    }

    const handleSubmit = async (e) =>{
        e.prevent.default();
    }

    // this is visual part jsx
    return (
    <> 
        <form className="border-2 border-b-cyan-300">
            <h1 className="text-4xl">LOGIN</h1>
            <label htmlFor="email"></label>
            <input  name='email' value={formData.email} onChange={handleChange} />
            <input name='password' value={formData.password} onChange={handleChange} />
            <div id="error"></div>
            <input type="button" placeholder="Login" />
        </form>
    </>
    )

}

export default LoginPage