"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  PiPencilLine,
  PiPlug,
  PiPuzzlePiece,
  PiRocket,
  PiSignOut,
  PiUsers,
} from "react-icons/pi";
import userImg from "@/public/images/user.png";
import useModalOpen from "@/hooks/useModalOpen";
import { useMainModal } from "@/stores/modal";
import { useAuthStore } from "@/stores/authStore";

function UserModal() {
  const { modalOpen } = useMainModal();
  const { modal, setModal, modalRef } = useModalOpen();
  const { signOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      setModal(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="relative size-9" ref={modalRef}>
      <button onClick={() => setModal((prev) => !prev)}>
        <Image
          src={userImg}
          alt=""
          className=" rounded-full  object-cover w-full h-full"
        />
      </button>
      <div
        className={`absolute top-12 right-0 bg-white dark:bg-n0 border border-primaryColor/30 p-3 rounded-xl  text-sm duration-300 z-30 text-n500 dark:text-n30 w-[240px] ${
          modal
            ? "visible translate-y-0 opacity-100 "
            : "invisible translate-y-2 opacity-0"
        } `}
      >
        <ul className={`flex flex-col gap-1 justify-start items-start`}>
          <li className="flex justify-start items-center gap-2 p-3 border-b border-primaryColor/30 cursor-pointer w-full">
            <Image src={userImg} alt="" className="size-7 rounded-full" />
            <span className="">Theresa Webb</span>
          </li>
          <li
            className="flex justify-start items-center gap-2 p-3 rounded-lg border border-transparent hover:border-primaryColor/30  hover:bg-primaryColor/5 duration-300 cursor-pointer w-full"
            onClick={() => {
              modalOpen("Edit Profile");
              setModal(false);
            }}
          >
            <PiPencilLine className="text-xl" />
            <span className="">Edit Profile</span>
          </li>
          <li>
            <Link
              href={"/explore"}
              onClick={() => setModal(false)}
              className="flex justify-start items-center gap-2 p-3 rounded-lg border border-transparent hover:border-primaryColor/30  hover:bg-primaryColor/5 duration-300 cursor-pointer w-full"
            >
              <PiUsers className="text-xl" />
              <span className="">Data Tutor Community</span>
            </Link>
          </li>
          <li className="flex justify-start items-center gap-2 p-3 rounded-lg border border-transparent hover:border-primaryColor/30  hover:bg-primaryColor/5 duration-300 cursor-pointer w-full">
            <PiPuzzlePiece className="text-xl" />
            <span className="">Get Data Tutor Extension</span>
          </li>
          <li
            className="flex justify-start items-center gap-2 p-3 rounded-lg border border-transparent hover:border-primaryColor/30  hover:bg-primaryColor/5 duration-300 cursor-pointer w-full"
            onClick={() => {
              modalOpen("Integrations");
              setModal(false);
            }}
          >
            <PiPlug className="text-xl" />
            <span className="">Integrations</span>
          </li>
          <li className="w-full">
            <Link
              href={"/upgrade-plan"}
              onClick={() => setModal(false)}
              className="flex justify-start items-center gap-2 p-3 rounded-lg border border-transparent hover:border-primaryColor/30  hover:bg-primaryColor/5 duration-300 cursor-pointer w-full"
            >
              <PiRocket className="text-xl" />
              <span className="">Upgrade Plan</span>
            </Link>
          </li>
          <li className="w-full">
            <button
              onClick={handleLogout}
              className="flex justify-start items-center gap-2 p-3 rounded-lg border border-transparent hover:border-errorColor/30  hover:bg-errorColor/5 duration-300 cursor-pointer w-full text-errorColor"
            >
              <PiSignOut className="text-xl" />
              <span className="">Log Out</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default UserModal;
