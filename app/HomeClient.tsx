"use client";

import React, { useCallback, useState } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import FeedCard from "@/components/FeedCard";
import { useCurrentUser } from "@/hooks/user";
import { useCreateTweet } from "@/hooks/tweet";
import { Tweet } from "@/gql/graphql";
import TwitterLayout from "@/components/Layout/TwitterLayout";
import Image from "next/image";
import { BiImageAlt } from "react-icons/bi";

const inter = Inter({ subsets: ["latin"] });

interface HomeClientProps {
  initialTweets: Tweet[];
}

export default function HomeClient({ initialTweets }: HomeClientProps) {
  const { user } = useCurrentUser();
  const { mutate } = useCreateTweet();
  const [content, setContent] = useState("");
  const [tweets, setTweets] = useState(initialTweets);

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
    // Optionally refresh tweets after creation
    // You might want to update the tweets state here
  }, [content, mutate]);

  return (
    <div className={inter.className}>
      <Toaster />
      <TwitterLayout>
        <div>
          <div className="border border-r-0 border-l-0 border-b-0 border-gray-600 sm:p-5 p-3 hover:bg-[#1D9BF0]/10 transition-colors duration-200 ease-out cursor-pointer">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-1 w-10">
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
                  className="w-full bg-transparent text-base sm:placeholder:text-xl px-3 border-b border-slate-700 resize-none outline-none focus:outline-none focus:ring-0"
                  placeholder="What's happening?"
                  rows={3}
                ></textarea>
                <div className="mt-2 flex justify-between items-center">
                  <BiImageAlt onClick={handleSelectImage} className="text-xl" />
                  <button
                    onClick={handleCreateTweet}
                    className="bg-[#1d9bf0] text-sm font-semibold sm:py-2 sm:px-4 p-1 rounded-full cursor-pointer"
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
      </TwitterLayout>
    </div>
  );
}
