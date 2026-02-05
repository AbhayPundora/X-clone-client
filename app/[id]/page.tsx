import FeedCard from "@/components/FeedCard";
import TwitterLayout from "@/components/Layout/TwitterLayout";
import { Tweet, User } from "@/gql/graphql";
import Image from "next/image";
import { BsArrowLeftShort } from "react-icons/bs";
import { graphqlClient } from "@/clients/api";
import { getUserByIdQuery } from "@/graphql/query/user";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getUserData(id: string) {
  const userInfo = await graphqlClient.request(getUserByIdQuery, { id });
  return userInfo.getUserById as User | null;
}

export default async function UserProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Console log params on server side
  // console.log("Server params:", resolvedParams);

  if (!id) {
    notFound();
  }

  const userData = await getUserData(id);

  if (!userData) {
    notFound();
  }

  // Console log props on server side
  // console.log("Server props:", { userData });

  return (
    <div>
      <TwitterLayout>
        <div>
          <nav className=" flex items-center gap-3 pl-3 pt-1">
            <BsArrowLeftShort className="text-4xl" />
            <div>
              <h1 className="text-xl font-bold">
                {userData.firstName} {userData.lastName || ""}
              </h1>
              <h1 className=" font-light text-sm text-slate-500">
                {userData.tweets?.length || 0} Tweets
              </h1>
            </div>
          </nav>
          <div className="p-4 border-b border-slate-800">
            {userData.profileImageURL && (
              <Image
                src={userData.profileImageURL}
                alt="user-image"
                className="rounded-full mt-3"
                width={100}
                height={100}
              />
            )}
            <h1 className="text-xl font-extrabold mt-4">
              {userData.firstName} {userData.lastName || ""}
            </h1>
          </div>
          <div>
            {userData.tweets?.map((tweet) => (
              <FeedCard data={tweet as Tweet} key={tweet?.id} />
            ))}
          </div>
        </div>
      </TwitterLayout>
    </div>
  );
}
