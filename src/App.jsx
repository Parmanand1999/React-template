// App.jsx

import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRoutes";
// import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContainer } from "react-toastify";

function App() {

  return (
    <>
      {/* <TooltipProvider> */}
        <RouterProvider router={router} />
        <ToastContainer position="top-right" autoClose={3000} />
      {/* </TooltipProvider> */}
    </>

  )

}

export default App;