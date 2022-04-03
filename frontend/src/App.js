import './App.css';
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./Pages/Login/Login"
import { Home } from "./Pages/Home/Home"
import {SignUp} from "./Pages/SignUp/SignUp"
import { CreateBudget } from './Pages/CreateBudget/CreateBudget';

function App() {
  return (
    <Router>
      <div>
        <Routes>
        <Route
          exact
          path="/"
          element={<Login/>}
      />
          <Route exact path="/login" element={<Login/>}/>
          <Route exact path="/home" element={<Home/>}/>
          <Route exact path="/signup" element={<SignUp/>}/>
          <Route exact path="/create_budget" element={<CreateBudget/>}/>
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;
