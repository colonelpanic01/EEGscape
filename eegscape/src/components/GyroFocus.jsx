import { useState, useEffect, useCallback } from "react";
import useEeg from "../hooks/useEeg";

const Memory = ({ setActiveComponent }) => {
    
    const { concentration, nod } = useEeg();

    return (
        <div>
            <p>Placeholder text</p>
        </div>
    );

  };
  
  export default Memory;