import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardOverview from './pages/DashboardOverview';
import Statistics from './pages/Statistics';
import PlacementReport from './pages/PlacementReport';
import StudentDetails from './pages/StudentDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout title="Dashboard Overview"><DashboardOverview /></Layout>} />
        <Route path="/statistics" element={<Layout title="Statistics"><Statistics /></Layout>} />
        <Route path="/placement-report" element={<Layout title="Placement Report"><PlacementReport /></Layout>} />
        <Route path="/student-details" element={<Layout title="Student Details"><StudentDetails /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
