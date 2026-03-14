import Navbar from './common/Navbar';
import SecurePage from './secure-info/SecurePage';
import CreateFile from './secure-info/CreateFile';
import FileContentPage from './secure-info/FileContentPage';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import About from './secure-info/About';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<SecurePage />} />
            <Route path="/create-file" element={<CreateFile />} />
            <Route path="/file-content" element={<FileContentPage />} />
            <Route path="/about" element={<About />} /> 
          </Routes>
        </div>
        {/* <Footer /> */}
      </div>
    </Router> 
  );
}
export default App;
