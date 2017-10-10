const fetch = require('node-fetch')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = require('graphql')

const headers = {
  'Content-Type': 'application/json',
  'trakt-api-version': 2,
  'trakt-api-key': process.env.TRAKT_KEY
}

const movieType = new GraphQLObjectType({
  name: 'Movie',
  fields: {
    title: {
      type: GraphQLString,
      resolve: json => {
        return json.movie.title
      }
    },
    year: {
      type: GraphQLInt,
      resolve: json => {
        return json.movie.year
      }
    }
  }
})

const userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    username: {
      type: GraphQLString,
      resolve: json => json.username
    },
    name: {
      type: GraphQLString,
      resolve: json => json.name
    },
    watchlist: {
      type: new GraphQLList(movieType),
      resolve: json => {
        const slug = json.ids.slug
        console.log('Fetching watchlist !')
        return Promise.resolve(
          fetch(`https://api.trakt.tv/users/${slug}/watchlist/movies`, {
            headers: headers
          }).then(response => response.json())
        )
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      user: {
        type: userType,
        args: {
          slug: { type: GraphQLString }
        },
        resolve: (root, args) =>
          fetch(`https://api.trakt.tv/users/${args.slug}`, {
            headers: headers
          }).then(response => response.json())
      }
    })
  })
})
