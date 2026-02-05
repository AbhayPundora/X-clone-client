import { graphqlClient } from "@/clients/api";
import { getAllTweetQuery } from "@/graphql/query/tweet"; // adjust path
import { Tweet } from "@/gql/graphql";
import HomeClient from "./HomeClient";

async function getAllTweets() {
  const response = await graphqlClient.request(getAllTweetQuery);
  return response.getAllTweets as Tweet[];
}

export default async function Home() {
  const tweets = await getAllTweets();

  // console.log("Server-side tweets:", tweets);

  return <HomeClient initialTweets={tweets} />;
}
