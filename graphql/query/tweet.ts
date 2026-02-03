import { graphql } from "@/gql";

export const getAllTweetQuery = graphql(`
  #graphql

  query GetAllTweets {
    getAllTweets {
      id
      content
      imageURL
      author {
        firstName
        lastName
        profileImageURL
      }
    }
  }
`);
