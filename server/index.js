const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

const people = [
    {
      id: '1',
      firstName: 'Bill',
      lastName: 'Gates'
    },
    {
      id: '2',
      firstName: 'Steve',
      lastName: 'Jobs'
    },
    {
      id: '3',
      firstName: 'Linux',
      lastName: 'Torvalds'
    }
  ]
  
  const cars = [
    {
      id: '1',
      year: '2019',
      make: 'Toyota',
      model: 'Corolla',
      price: '40000',
      personId: '1'
    },
    {
      id: '2',
      year: '2018',
      make: 'Lexus',
      model: 'LX 600',
      price: '13000',
      personId: '1'
    },
    {
      id: '3',
      year: '2017',
      make: 'Honda',
      model: 'Civic',
      price: '20000',
      personId: '1'
    },
    {
      id: '4',
      year: '2019',
      make: 'Acura ',
      model: 'MDX',
      price: '60000',
      personId: '2'
    },
    {
      id: '5',
      year: '2018',
      make: 'Ford',
      model: 'Focus',
      price: '35000',
      personId: '2'
    },
    {
      id: '6',
      year: '2017',
      make: 'Honda',
      model: 'Pilot',
      price: '45000',
      personId: '2'
    },
    {
      id: '7',
      year: '2019',
      make: 'Volkswagen',
      model: 'Golf',
      price: '40000',
      personId: '3'
    },
    {
      id: '8',
      year: '2018',
      make: 'Kia',
      model: 'Sorento',
      price: '45000',
      personId: '3'
    },
    {
      id: '9',
      year: '2017',
      make: 'Volvo',
      model: 'XC40',
      price: '55000',
      personId: '3'
    }
  ]
  
const typeDefs = gql`
  type Person {
    id: ID!
    firstName: String!
    lastName: String!
    cars: [Car]
  }

  type Car {
    id: ID!
    year: Int!
    make: String!
    model: String!
    price: Float!
    personId: String!
  }

  type Query {
    people: [Person]
    cars: [Car]
    person(id: ID!): Person
  }

  type Mutation {
    addPerson(firstName: String!, lastName: String!): Person
    updatePerson(id: ID!, firstName: String!, lastName: String!): Person
    deletePerson(id: ID!): Person
    addCar(year: Int!, make: String!, model: String!, price: Float!, personId: String!): Car
    updateCar(id: ID!, year: Int!, make: String!, model: String!, price: Float!, personId: String!): Car
    deleteCar(id: ID!): Car
  }
`;

const resolvers = {
  Query: {
    people: () => people,
    cars: () => cars,
    person: (_, { id }) => people.find(person => person.id === id),
  },

  Mutation: {
    addPerson: (_, { firstName, lastName }) => {
      const newPerson = { id: uuidv4(), firstName, lastName };
      people.push(newPerson);
      return newPerson;
    },

    updatePerson: (_, { id, firstName, lastName }) => {
      const personIndex = people.findIndex(person => person.id === id);
      if (personIndex === -1) return null;
      people[personIndex] = { ...people[personIndex], firstName, lastName };
      return people[personIndex];
    },

    deletePerson: (_, { id }) => {
      const personIndex = people.findIndex(person => person.id === id);
      if (personIndex === -1) return null;
      const deletedPerson = people.splice(personIndex, 1)[0];
      cars = cars.filter(car => car.personId !== id);
      return deletedPerson;
    },

    addCar: (_, { year, make, model, price, personId }) => {
      const newCar = { id: uuidv4(), year, make, model, price, personId };
      cars.push(newCar);
      return newCar;
    },

    updateCar: (_, { id, year, make, model, price, personId }) => {
      const carIndex = cars.findIndex(car => car.id === id);
      if (carIndex === -1) return null;
      cars[carIndex] = { ...cars[carIndex], year, make, model, price, personId };
      return cars[carIndex];
    },
    
    deleteCar: (_, { id }) => {
      const carIndex = cars.findIndex(car => car.id === id);
      if (carIndex === -1) return null;
      return cars.splice(carIndex, 1)[0];
    },
  },
  Person: {
    cars: (parent) => cars.filter(car => car.personId === parent.id),
  },
};

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  app.listen({ port: PORT }, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}


startServer();
