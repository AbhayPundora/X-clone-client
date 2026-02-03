"use client";

import React, { useCallback, useState } from "react";
import { BsTwitter, BsBell, BsEnvelope, BsBookmark } from "react-icons/bs";
import {
  BiHomeCircle,
  BiHash,
  BiUser,
  BiMoney,
  BiImageAlt,
} from "react-icons/bi";
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
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import { Tweet } from "@/gql/graphql";

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
  // console.log(user);
  const { tweets = [] } = useGetAllTweets();
  const { mutate } = useCreateTweet();

  const queryClient = useQueryClient();

  const [content, setContent] = useState("");

  const handleSelectImage = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
  }, []);

  const handleCreateTweet = useCallback(() => {
    mutate({
      content,
    });
    // setContent("");
  }, [content, mutate]);

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
                  className="flex justify-start items-center gap-4  border-gray-600 p-5 hover:bg-[#1D9BF0]/10 transition-colors duration-200 ease-out  rounded-full px-5 py-2 mt-2 w-fit cursor-pointer"
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
                  height={40}
                  width={40}
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
        <main className="scrollbar-hide col-span-5 border-r border-l h-screen overflow-x-hidden overflow-y-scroll border-gray-600 scrollbar-hide">
          <div>
            <div className="border border-r-0 border-l-0 border-b-0 border-gray-600 p-5  hover:bg-[#1D9BF0]/10 transition-colors duration-200 ease-out  cursor-pointer">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-1">
                  {user?.profileImageURL && (
                    <Image
                      className="rounded-full"
                      src={user?.profileImageURL}
                      alt="user image"
                      height={50}
                      width={50}
                    />
                  )}
                </div>
                <div className="col-span-11">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent  px-3 border-b border-slate-700 resize-none outline-none focus:outline-none focus:ring-0"
                    placeholder="What's happening?"
                    rows={3}
                  ></textarea>
                  <div className="mt-2 flex justify-between items-center">
                    <BiImageAlt
                      onClick={handleSelectImage}
                      className="text-xl"
                    />
                    <button
                      onClick={handleCreateTweet}
                      className="bg-[#1d9bf0] text-sm font-semibold py-2 px-4 rounded-full  cursor-pointer"
                    >
                      Tweet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {tweets?.map((tweet) =>
            tweet ? <FeedCard key={tweet?.id} data={tweet as Tweet} /> : null,
          )}
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
