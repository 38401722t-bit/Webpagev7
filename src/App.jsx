import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import Destinations from "@/pages/Destinations";
import DestinationDetail from "@/pages/DestinationDetail";
import Explore from "@/pages/Explore";
import MultiStop from "@/pages/MultiStop";
import Planner from "@/pages/Planner";
import Tracking from "@/pages/Tracking";
import States from "@/pages/States";
import StateDetail from "@/pages/StateDetail";
import Routes2 from "@/pages/Routes";
import Safety from "@/pages/Safety";
import Dashboard from "@/pages/Dashboard";
import Account from "@/pages/Account";
import Wishlist from "@/pages/Wishlist";
import Trips from "@/pages/Trips";
import { Login, Register } from "@/pages/Auth";
import Alerts from "@/pages/Alerts";
import SharedTrip from "@/pages/SharedTrip";
import Recap from "@/pages/Recap";
import FoodTrail from "@/pages/FoodTrail";
import Translator from "@/pages/Translator";
import AITravel from "@/pages/AITravel";
import Weather from "@/pages/Weather";
import BackgroundSlide from "@/components/BackgroundSlide";
import { AuthProvider } from "@/context/AuthContext";
import { ModeProvider } from "@/context/ModeContext";
import { Toaster } from "@/components/ui/sonner";

const App = () => (
  <div className="App">
    <BackgroundSlide />
    <BrowserRouter>
      <AuthProvider>
        <ModeProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai" element={<AITravel />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/multi" element={<MultiStop />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/routes" element={<Routes2 />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/states" element={<States />} />
          <Route path="/states/:name" element={<StateDetail />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/trip/:token" element={<SharedTrip />} />
          <Route path="/trip/:token/recap" element={<Recap />} />
          <Route path="/food-trail/:destId" element={<FoodTrail />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/translator" element={<Translator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Toaster position="top-center" theme="dark" richColors />
        </ModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </div>
);

export default App;
