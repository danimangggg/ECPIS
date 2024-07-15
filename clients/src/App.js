import Navbar2 from './components/Navbar/Navbar2'
import './App.css'
import Dashbord from './pages/Creadit/Dashbord'
import addContract from './pages/Creadit/AddCreaditPage'
import viewContract from './pages/Creadit/ViewCredit'
import FacilitProfile from './pages/facility-info/FacilityInfo/FacilityInfoPage'
import AddFacility from './pages/facility-info/FacilityInfo/AddFacilityPage'
import addRegionPage from './pages/facility-info/Region/addRegionPage';
import WoredaPage from './pages/facility-info/Woreda/addWoreda';
import ViewWoredaPage from './pages/facility-info/Woreda/viewWoredaPage';
import ViewZonePage from './pages/facility-info/Zone/viewZonePage';
import ViewRegionPage from './pages/facility-info/Region/viewRegionPage';
import ZonePage from './pages/facility-info/Zone/addZone';
import DetailPage from './pages/Detail/DetailPage';
import updateCredit from './pages/Creadit/UpdateCreaditPage';
import loading from './pages/stylePage/loadingPage';
import ViewPod from './pages/Pod/viewPodPage';
import addPod from './pages/Pod/addPodPage';
import DetailPodPage from './pages/Detail/DetailPodPage';
import updatePod from './pages/Pod/updatePodPage';
import AddPodReceiver from './pages/Pod/PodHandler/addReceiver';
import addPodRegisterer from './pages/Pod/PodHandler/addRegisterer';
import ViewPodReceiver from './pages/Pod/PodHandler/viewReceiver';
import ViewPodRegisterer from './pages/Pod/PodHandler/viewRegisterer';
import SignIn from './pages/UserAccountPage/SignInPage';
import ProtectedComponent from './components/UserAccount/ProtectedComponents';
import { AuthProvider } from './components/UserAccount/AutoContext';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
const App = () => {
  return (
   <>

<AuthProvider>
     <Router>
     <Navbar2/>

      <Routes>
        <Route path = '/' Component={SignIn} />
        <Route path = '/login' Component={SignIn} />
        <Route path = '/add-facility' exact Component={AddFacility}/>
        <Route path = '/addContract' Component={addContract} />
        <Route path = '/viewContract' Component={viewContract} />
        <Route path = '/dashbord' Component={Dashbord} />
        <Route path = '/facility-profile' Component={FacilitProfile} />
        <Route path = '/add-region' Component={addRegionPage} />
        <Route path = '/add-zone' Component={ZonePage} />
        <Route path = '/add-woreda' Component={WoredaPage} />
        <Route path = '/viewWoreda' Component={ViewWoredaPage} />
        <Route path = '/viewZone' Component={ViewZonePage} />
        <Route path = '/viewRegion' Component={ViewRegionPage} />
        <Route path = '/detailPage' Component={DetailPage} />
        <Route path = '/updateCreadit' Component={updateCredit} />
        <Route path = '/loading' Component={loading} />
        <Route path = '/viewPod' Component={ViewPod} />
        <Route path = '/add-pod' Component={addPod} />
        <Route path = '/detailPodPage' Component={DetailPodPage} />
        <Route path = '/updatePod' Component={updatePod} />
        <Route path = '/add-receiver' Component={AddPodReceiver} />
        <Route path = '/add-registrant' Component={addPodRegisterer} />
        <Route path = '/viewreceiver' Component={ViewPodReceiver} />
        <Route path = '/viewregistrant' Component={ViewPodRegisterer} />
        
      </Routes>
     </Router>
      </AuthProvider>
     <br/><br/><br/><br/>
     <footer className="footer" style={{
          "background-color": "#f8f9fa",
          "padding": "2px",
          "text-align": "center",
          "position": "fixed",
          "left": "0",
          "bottom": "0",
          "width": "100%",
        }}>
      <p>© 2024 EPSS AA1 Branch. All rights reserved.</p>
    </footer>
   </>
  );
};

export default App;
