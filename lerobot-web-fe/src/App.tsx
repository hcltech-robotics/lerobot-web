import DrawerMenu from './components/layout/DrawerMenu/DrawerMenu';

import './App.css';
import { BrandLogo } from './components/BrandLogo';
import { DashboardLayout } from './components/scene-view/DashboardLayout';

function App() {
  return (
    <>
      <DrawerMenu>
        <DashboardLayout />
        <BrandLogo />
      </DrawerMenu>
    </>
  );
}

export default App;
