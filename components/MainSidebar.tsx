import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  PiAlignLeft,
  PiArchive,
  PiArrowUUpLeft,
  PiDeviceMobileCamera,
  PiDiamondsFour,
  PiDotsThreeBold,
  PiGear,
  PiLightning,
  PiMagnifyingGlass,
  PiPencilLine,
  PiQuestion,
  PiRobot,
  PiShareFat,
  PiTrash,
} from "react-icons/pi";
import Link from "next/link";
import { useMainModal } from "@/stores/modal";
import { useChatHandler } from "@/stores/chatList";
import { usePathname, useRouter } from "next/navigation";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import dynamic from "next/dynamic";

const SubscriptionOverlay = dynamic(() => import("@/app/components/SubscriptionOverlay"), {
  ssr: false,
});

// Number of chats to show per "page"
const CHATS_PER_PAGE = 10;

type MainSidebarProps = {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

function MainSidebar({ showSidebar, setShowSidebar }: MainSidebarProps) {
  const [showMoreButton, setShowMoreButton] = useState(NaN);
  const { modalOpen } = useMainModal();
  const { chatList } = useChatHandler();
  const [displayedChats, setDisplayedChats] = useState<Array<{id: string; title: string}>>([]);
  const [page, setPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const chatListRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { hasActiveSubscription } = useSubscriptionStore();
  
  // Initialize chats display
  useEffect(() => {
    if (chatList && chatList.length > 0) {
      // Filter out roadmap chats before displaying
      const filteredChats = chatList.filter(chat => !chat.is_roadmap_chat);
      const initialChats = filteredChats.slice(0, CHATS_PER_PAGE);
      setDisplayedChats(initialChats);
      setHasMoreChats(filteredChats.length > CHATS_PER_PAGE);
      setPage(1);
    }
  }, [chatList]);
  
  // Load more chats when scrolling down - wrapped in useCallback to prevent dependency changes
  const loadMoreChats = useCallback(() => {
    if (isLoadingMore || !hasMoreChats || !chatList) return;
    
    setIsLoadingMore(true);
    
    // Filter out roadmap chats before loading more
    const filteredChats = chatList.filter(chat => !chat.is_roadmap_chat);
    
    // Calculate the next batch of chats to load
    const nextPage = page + 1;
    const endIdx = nextPage * CHATS_PER_PAGE;
    const newChats = filteredChats.slice(0, endIdx);
    
    // Update state
    setDisplayedChats(newChats);
    setPage(nextPage);
    setHasMoreChats(endIdx < filteredChats.length);
    
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 300);
  }, [chatList, hasMoreChats, isLoadingMore, page]);
  
  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMoreChats) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreChats();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMoreChats, isLoadingMore, loadMoreChats]);
  
  useEffect(() => {
    if (window.innerWidth > 992) {
      setShowSidebar(true);
    }
  }, [setShowSidebar]);

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    // If this is a specific chat link, check if it matches the current path
    if (path.startsWith("/chat/")) {
      return pathname === path;
    }
    // For "General" tab, only make it active if we're on /new-chat page
    if (path === "/new-chat") {
      return pathname === "/new-chat";
    }
    // For other paths
    return pathname.startsWith(path);
  };

  // Handle subscription-restricted navigation
  const handleRestrictedNavigation = (path: string, e: React.MouseEvent) => {
    if (!hasActiveSubscription) {
      e.preventDefault();
      setShowSubscriptionOverlay(true);
    } else {
      router.push(path);
    }
  };

  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);

  return (
    <>
      <div
        className={`w-[312px] bg-white dark:bg-[#1A1915] border-r border-primaryColor/20 h-dvh overflow-hidden duration-500 max-lg:absolute z-40 top-0 left-0 ${
          showSidebar
            ? "visible opacity-100"
            : "max-lg:invisible max-lg:opacity-0 ml-[-312px]"
        }`}
      >
        <div
          className="p-5 bg-primaryColor/5 h-full flex flex-col"
        >
          {/* Header section - fixed */}
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex justify-start items-center gap-1.5">
                <img 
                  src="/images/DataTutorCircle.png" 
                  alt="Data Tutor Logo" 
                  width={48} 
                  height={48}
                  className="object-contain"
                />
                <span className="text-2xl font-semibold text-n700 dark:text-n30">
                  Data Tutor
                </span>
              </div>
              <div className="flex justify-start items-center gap-2">
                <button
                  onClick={() => modalOpen("Search")}
                  className="bg-white p-2 rounded-full flex justify-center items-center border border-primaryColor/20 dark:bg-[#1A1915]"
                >
                  <PiMagnifyingGlass />
                </button>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="bg-white p-2 rounded-full flex justify-center items-center border border-primaryColor/20 dark:bg-[#1A1915]"
                >
                  <PiArrowUUpLeft />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1 justify-start items-start pt-5 lg:pt-12 pb-5">
              <Link
                href={"/new-chat"}
                className={`flex justify-start w-full py-3 px-6 items-center gap-2 rounded-xl transition-colors duration-300 ${
                  isActive("/new-chat")
                    ? "text-white bg-primaryColor"
                    : "hover:text-primaryColor hover:bg-primaryColor/10"
                }`}
              >
                <PiLightning size={20} className={isActive("/new-chat") ? "" : "text-primaryColor"} />
                <span className="text-sm font-medium">General</span>
              </Link>
              <button
                onClick={(e) => handleRestrictedNavigation("/roadmap", e)}
                className={`flex justify-start w-full py-3 px-6 items-center gap-2 rounded-xl transition-colors duration-300 text-left ${
                  isActive("/roadmap")
                    ? "text-white bg-primaryColor"
                    : "hover:text-primaryColor hover:bg-primaryColor/10"
                }`}
              >
                <PiRobot size={20} className={isActive("/roadmap") ? "" : "text-primaryColor"} />
                <span className="text-sm">Roadmap</span>
              </button>
              <button
                onClick={(e) => handleRestrictedNavigation("/explore", e)}
                className={`flex justify-start w-full py-3 px-6 items-center gap-2 rounded-xl transition-colors duration-300 text-left ${
                  isActive("/explore")
                    ? "text-white bg-primaryColor"
                    : "hover:text-primaryColor hover:bg-primaryColor/10"
                }`}
              >
                <PiDiamondsFour size={20} className={isActive("/explore") ? "" : "text-primaryColor"} />
                <span className="text-sm">Interview Prep</span>
              </button>
            </div>
          </div>

          {/* Chat list section - scrollable */}
          <div className="flex-1 flex flex-col min-h-0 mb-3">
            <p className="text-xs font-semibold text-n700 dark:text-n30 mb-2">
              Recent
            </p>
            <div className="overflow-y-auto flex-1 scrollbar-hide" ref={chatListRef}>
              <div className="flex flex-col gap-1 justify-start items-start w-full">
                {displayedChats.map(({ id, title }, idx) => (
                  <div
                    className={`flex justify-between items-center gap-2 hover:text-primaryColor rounded-xl duration-500 py-3 px-6 relative w-full ${
                      pathname === `/chat/${id}` 
                        ? "text-white bg-primaryColor" 
                        : "hover:bg-primaryColor/10"
                    }`}
                    key={id}
                  >
                    <Link
                      href={`/chat/${id}`}
                      className="flex justify-center items-center gap-2"
                    >
                      <PiAlignLeft size={20} className={pathname === `/chat/${id}` ? "text-white" : "text-primaryColor"} />
                      <span className="text-sm">
                        {title.split("").slice(0, 20).join("")}
                      </span>
                    </Link>
                    <button
                      onClick={() =>
                        setShowMoreButton(idx === showMoreButton ? NaN : idx)
                      }
                    >
                      <PiDotsThreeBold className="text-xl" />
                    </button>
                    <ul
                      className={`absolute top-9 right-0 bg-white dark:bg-n0 border border-primaryColor/30 p-3 rounded-xl flex flex-col gap-1 justify-start items-start text-sm duration-300 z-40 text-n500 dark:text-n30 ${
                        showMoreButton === idx
                          ? "visible translate-y-0 opacity-100"
                          : "invisible translate-y-2 opacity-0"
                      }`}
                    >
                      <li className="flex justify-start items-center gap-1 py-2 px-3 rounded-lg border border-transparent hover:border-primaryColor/30 hover:bg-primaryColor/5 duration-300 cursor-pointer w-full">
                        <PiPencilLine />
                        <span>Rename</span>
                      </li>
                      <li className="flex justify-start items-center gap-1 py-2 px-3 rounded-lg border border-transparent hover:border-primaryColor/30 hover:bg-primaryColor/5 duration-300 cursor-pointer w-full">
                        <PiShareFat />
                        <span>Share</span>
                      </li>
                      <li className="flex justify-start items-center gap-1 py-2 px-3 rounded-lg border border-transparent hover:border-primaryColor/30 hover:bg-primaryColor/5 duration-300 cursor-pointer w-full">
                        <PiArchive />
                        <span>Archive</span>
                      </li>
                      <li className="flex justify-start items-center gap-1 py-2 px-3 rounded-lg border border-transparent hover:border-errorColor/30 hover:bg-errorColor/5 duration-300 cursor-pointer text-errorColor w-full">
                        <PiTrash />
                        <span>Delete</span>
                      </li>
                    </ul>
                  </div>
                ))}
                
                {/* Loading indicator / load more reference */}
                {hasMoreChats && (
                  <div 
                    ref={loadMoreRef} 
                    className="w-full py-2 text-center"
                  >
                    {isLoadingMore ? (
                      <div className="w-6 h-6 border-2 border-primaryColor/30 border-t-primaryColor rounded-full animate-spin mx-auto"></div>
                    ) : (
                      <div className="text-xs text-slate-400 py-2">Loading more chats...</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer section - fixed */}
          <div className="flex-shrink-0">
            <div className="flex flex-col gap-1 justify-start items-start pb-2">
              <button
                className="w-full flex justify-between items-center py-3 px-6 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500"
                onClick={() => modalOpen("Support Modal")}
              >
                <span className="flex justify-center items-center gap-2">
                  <PiQuestion size={20} className="text-primaryColor" />
                  <span className="text-sm">Support</span>
                </span>
                <span className="block size-1 rounded-full bg-successColor"></span>
              </button>
              <button
                className="w-full flex justify-between items-center py-3 px-6 hover:text-primaryColor hover:bg-primaryColor/10 rounded-xl duration-500"
                onClick={() => modalOpen("Settings")}
              >
                <span className="flex justify-center items-center gap-2">
                  <PiGear size={20} className="text-primaryColor" />
                  <span className="text-sm">Settings</span>
                </span>
                <span className="block size-1 rounded-full bg-successColor"></span>
              </button>
            </div>

            <div className="flex justify-between items-center rounded-xl py-3 px-6 bg-primaryColor/5 border border-primaryColor/30">
              <button className="flex justify-center items-center gap-2 font-medium text-primaryColor">
                <PiDeviceMobileCamera size={20} className="" />
                <span className="text-sm">Get App</span>
              </button>

              <span className="px-3 py-1 rounded-full border bg-secondaryColor/5 border-secondaryColor/30 text-secondaryColor text-xs">
                New
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Overlay */}
      {showSubscriptionOverlay && (
        <SubscriptionOverlay onClose={() => setShowSubscriptionOverlay(false)} />
      )}
    </>
  );
}

export default MainSidebar;
