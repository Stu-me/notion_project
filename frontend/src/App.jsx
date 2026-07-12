import { BrowserRouter, Routes , Route , Navigate} from 'react-router-dom'
import DashBoardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PageEditor from './pages/PageEditor'
import ProtectedRoute from './components/ProtectedRoute'



function  App() {

  return (
    <>
    {/* we are making routes in the frontend that connects the pages and components */}
    <BrowserRouter>
    <Routes>
      {/* we use navigat in the  / cause dashboard is protected and if we simply  <dashboard people will surpass the authentication > */}
      <Route path='/' element = {<Navigate to='/dashboard'></Navigate>} /> 
      <Route path='/login' element={<LoginPage></LoginPage>} />
      <Route path='/register' element={<RegisterPage></RegisterPage>} />
      <Route path='/dashboard' element={<ProtectedRoute><DashBoardPage></DashBoardPage></ProtectedRoute>} />
      <Route path='/page/:id' element={<ProtectedRoute><PageEditor></PageEditor></ProtectedRoute>} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
