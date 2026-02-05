"use client";

import React, { useCallback, useMemo } from "react";

import { BsTwitter, BsBell, BsEnvelope, BsBookmark } from "react-icons/bs";
import { BiHomeCircle, BiHash, BiUser, BiMoney } from "react-icons/bi";
import { SlOptions } from "react-icons/sl";
import { useCurrentUser } from "@/hooks/user";
import Image from "next/image";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import toast from "react-hot-toast";
import { graphqlClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

interface TwitterLayoutProps {
  children: React.ReactNode;
}

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
  link: string;
}

/* TwitterLayout  component ----
   
  sidebar

  main-page --- can be app/page.tsx (default) or app/[id]/page.tsx (if someone want to see user's profile page)

  sidebar

*/

const TwitterLayout: React.FC<TwitterLayoutProps> = (props) => {
  const { user } = useCurrentUser();
  // console.log(user);

  const queryClient = useQueryClient();

  const sidebarMenuItems: TwitterSidebarButton[] = useMemo(
    () => [
      { title: "Home", icon: <BiHomeCircle />, link: "/" },
      { title: "Explore", icon: <BiHash />, link: "/" },
      { title: "Notifications", icon: <BsBell />, link: "/" },
      { title: "Messages", icon: <BsEnvelope />, link: "/" },
      { title: "Bookmarks", icon: <BsBookmark />, link: "/" },
      { title: "Twitter Blue", icon: <BiMoney />, link: "/" },
      { title: "Profile", icon: <BiUser />, link: `/${user?.id}` },
      { title: "More", icon: <SlOptions />, link: "/" },
    ],
    [user?.id],
  );

  /* Data Flow --
      first we login
      then we set the token to localstorage("__twitter_token")
      then we invalided await queryClient.invalidateQueries(["current-user"])
      this will run the queryFn in hooks/user.ts and execute the "getCurrentUserQuery" query
  */
  const handleLoginWithGoogle = useCallback(
    async (cred: CredentialResponse) => {
      const googleToken = cred.credential;
      if (!googleToken) return toast.error("Google token not found");

      const { verifyGoogleToken } = await graphqlClient.request(
        verifyUserGoogleTokenQuery,
        { token: googleToken },
      );

      toast.success("Verified Success");

      if (verifyGoogleToken)
        window.localStorage.setItem("__twitter_token", verifyGoogleToken);
      console.log(verifyGoogleToken);

      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    [queryClient],
  );

  return (
    <div>
      <div className="grid grid-cols-12 h-screen w-screen sm:px-28">
        {/* Sidebar */}
        <aside className="col-span-2  sm:flex sm:col-span-3 lg:col-span-3 pr-1 lg:pt-1 lg:pr-[5.5rem] justify-end relative">
          <div>
            <div className="sm:text-3xl text-2xl h-fit hover:bg-gray-800 rounded-full p-4 cursor-pointer transition-all w-fit">
              <BsTwitter />
            </div>

            <nav className="mt-2 text-xl font-light pr-4">
              <ul>
                {sidebarMenuItems.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.link}
                      className="flex justify-start items-center gap-4  border-gray-600 p-5 hover:bg-[#1D9BF0]/10 transition-colors duration-200 ease-out  rounded-full px-5 py-2 mt-2 w-fit cursor-pointer"
                    >
                      <span className="sm:text-2xl ">{item.icon}</span>
                      <span className="hidden sm:inline ">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="sm:mt-5 sm:px-3 ">
                <button className="bg-[#1d9bf0] sm:text-lg text-sm font-semibold sm:py-3 sm:px-2 py-1 sm:rounded-full  rounded-3xl w-full cursor-pointer">
                  Tweet
                </button>
              </div>
            </nav>
            {user && (
              <div className="absolute bottom-5 flex gap-2 items-center p-3 rounded-full">
                {user && user.profileImageURL && (
                  <Image
                    className="rounded-full"
                    src={user?.profileImageURL}
                    alt="Profile image"
                    height={40}
                    width={40}
                  />
                )}
                <div className="hidden sm:block">
                  <h3 className="inline mr-1 font-bold">{user.firstName}</h3>
                  <h3 className="inline font-bold">{user.lastName}</h3>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Feed */}
        <main className="scrollbar-hide  col-span-6 sm:col-span-9 lg:col-span-5 border-r border-l h-screen overflow-x-hidden overflow-y-scroll border-gray-600">
          {props.children}
        </main>

        {/* Right Panel */}
        <aside className="hidden lg:block lg:col-span-3 p-5 max-w-fit text-center">
          {!user && (
            <div className="p-5 bg-slate-700 rounded-lg">
              <h1 className="my-2">New to Twitter?</h1>
              <GoogleLogin onSuccess={handleLoginWithGoogle} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TwitterLayout;
