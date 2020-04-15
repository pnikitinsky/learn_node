const Express = require('express')
const mongoose = require('mongoose')
const ExpressGraphQl = require('express-graphql')
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull
} = require('graphql')

const app = Express()

mongoose.connect('mongodb://mongo:27017/learn_node')

const personModelSchema = new mongoose.Schema({
  lastname: String,
  firstname: String
});

const PersonModel = mongoose.model('Person', personModelSchema)

const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    id: { type: GraphQLID },
    lastname: { type: GraphQLString },
    firstname: { type: GraphQLString }
  }
})

mongoose.connection.on('error', err => {
  console.log(err)
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      people: {
        type: GraphQLList(PersonType),
        resolve: (_root, _args, _context, _info) => {
          return PersonModel.find().exec();
        }
      },
      person: {
        type: PersonType,
        args: {
          id: { type: GraphQLNonNull(GraphQLID) }
        },
        resolve: (root, args, _context, _info) => {
          return PersonModel.findById(args.id).exec();
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      person: {
        type: PersonType,
        args: {
          firstname: { type: GraphQLNonNull(GraphQLString) },
          lastname: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (root, args, _context, _info) => {
          const person = new PersonModel(args)
          return person.save();
        }
      }
    }
  })
});

app.use('/graphql', ExpressGraphQl({
  schema,
  graphiql: true
}))

app.listen(3000, () => {
  console.log('listening 3000')
})

app.get('/', (req, res) => {
  res.send('hello world1')
})
