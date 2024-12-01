import { useState } from "react";
import Menu from "../components/Menu";

function Home() {
  const [showMenu, setShowMenu] = useState(false);

  const handleContinue = () => {
    setShowMenu(true);
  };

  return (
    <div>
      {showMenu ? <Menu /> : <Welcome onContinue={handleContinue} />}
    </div>
  );
}

export default Home;
