"use client";

import React, { useCallback } from "react";
import { BsTwitter, BsBell, BsEnvelope, BsBookmark } from "react-icons/bs";
import { BiHomeCircle, BiHash, BiUser, BiMoney } from "react-icons/bi";
import { SlOptions } from "react-icons/sl";
import { Inter } from "next/font/google";
import toast, { Toaster } from "react-hot-toast";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

import FeedCard from "@/components/FeedCard";
import { graphqlClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useCurrentUser } from "@/hooks/user";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
}

const sidebarMenuItems: TwitterSidebarButton[] = [
  { title: "Home", icon: <BiHomeCircle /> },
  { title: "Explore", icon: <BiHash /> },
  { title: "Notifications", icon: <BsBell /> },
  { title: "Messages", icon: <BsEnvelope /> },
  { title: "Bookmarks", icon: <BsBookmark /> },
  { title: "Twitter Blue", icon: <BiMoney /> },
  { title: "Profile", icon: <BiUser /> },
  { title: "More", icon: <SlOptions /> },
];

export default function Home() {
  const { user } = useCurrentUser();
  console.log(user);

  const queryClient = useQueryClient();

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
    <div className={inter.className}>
      <Toaster />

      <div className="grid grid-cols-12 h-screen w-screen px-28">
        {/* Sidebar */}
        <aside className="col-span-3 pt-1 ml-9 relative">
          <div className="text-3xl h-fit hover:bg-gray-800 rounded-full p-4 cursor-pointer transition-all w-fit">
            <BsTwitter />
          </div>

          <nav className="mt-2 text-xl font-light pr-4">
            <ul>
              {sidebarMenuItems.map((item) => (
                <li
                  key={item.title}
                  className="flex justify-start items-center gap-4 hover:bg-gray-800 rounded-full px-5 py-2 mt-2 w-fit cursor-pointer"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 px-3">
              <button className="bg-[#1d9bf0] text-lg font-semibold py-3 px-2 rounded-full w-full cursor-pointer">
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
                  height={50}
                  width={50}
                />
              )}
              <div>
                <h3 className="inline mr-1 font-bold">{user.firstName}</h3>
                <h3 className="inline font-bold">{user.lastName}</h3>
              </div>
            </div>
          )}
        </aside>

        {/* Feed */}
        <main className="col-span-5 border-r border-l h-screen overflow-x-hidden overflow-y-scroll border-gray-600">
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
        </main>

        {/* Right Panel */}
        <aside className="col-span-3 p-5 max-w-fit text-center">
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
}
