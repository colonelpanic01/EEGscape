import { useState } from "react";
import Welcome from "../components/Welcome";
import Menu from "../components/Menu";

function Home() {
  const [showMenu, setShowMenu] = useState(false);

  const handleContinue = () => {
    setShowMenu(true);
  };

  return (
    // <Menu />
    <div>{showMenu ? <Menu /> : <Welcome onContinue={handleContinue} />}</div>
  );
}

export default Home;
