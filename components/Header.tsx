import React from "react";
import { PiList, PiUploadSimple, PiRobot } from "react-icons/pi";
import UserModal from "./header/UserModal";
import { useMainModal } from "@/stores/modal";
import ThemeSwitch from "./ThemeSwitch";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";

type HeaderProps = {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

function Header({ showSidebar, setShowSidebar }: HeaderProps) {
  const { modalOpen } = useMainModal();
  const pathname = usePathname();
  const isRoadmapPage = pathname === "/roadmap";

  return (
    <div className="px-6 py-3 flex justify-between items-center w-full sticky top-0 left-0 right-0 bg-white z-30 dark:bg-[#1A1915] dark:bg-opacity-95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex justify-start items-center gap-2">
        <button
          className={`${showSidebar ? "hidden" : ""}`}
          onClick={() => setShowSidebar(true)}
        >
          <PiList className="text-2xl" />
        </button>
        
        {isRoadmapPage && (
          <div className="flex items-center ml-2">
            <PiRobot className="text-xl text-primaryColor mr-2" />
            <div>
              <h1 className="text-lg font-semibold">Roadmap</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Your personalized learning journey</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-start items-center gap-2 sm:gap-4">
        {isRoadmapPage && (
          <button 
            onClick={() => modalOpen("Roadmap Images")}
            className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-primaryColor hover:bg-primaryColor/90 transition-colors text-white mr-2"
          >
            <MapPin size={16} />
            <span className="text-xs font-medium">Show Road Map</span>
          </button>
        )}
        
        <ThemeSwitch />
        {pathname === "/custom-bots" && (
          <button
            onClick={() => modalOpen("Create New Bot")}
            className="flex justify-center items-center gap-2 py-2 px-2 sm:px-4 rounded-full border border-primaryColor text-primaryColor"
          >
            <PiUploadSimple />
            <span className="text-xs font-medium max-[400px]:hidden">
              Create New
            </span>
          </button>
        )}

        <UserModal />
      </div>
    </div>
  );
}

export default Header;
