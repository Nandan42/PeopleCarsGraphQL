// src/graphql/queries.js
import { gql } from '@apollo/client';

export const GET_PEOPLE_AND_CARS = gql`
  query GetPeopleAndCars {
    people {
      id
      firstName
      lastName
      cars {
        id
        year
        make
        model
        price
      }
    }
    cars {
      id
      year
      make
      model
      price
      personId
    }
  }
`;


export const ADD_PERSON = gql`
  mutation AddPerson($firstName: String!, $lastName: String!) {
    addPerson(firstName: $firstName, lastName: $lastName) {
      id
      firstName
      lastName
    }
  }
`;


export const ADD_CAR = gql`
  mutation AddCar($year: Int!, $make: String!, $model: String!, $price: Float!, $personId: String!) {
    addCar(year: $year, make: $make, model: $model, price: $price, personId: $personId) {
      id
      year
      make
      model
      price
      personId
    }
  }
`;


export const GET_PERSON_WITH_CARS = gql`
  query GetPersonWithCars($personId: ID!) {
    person(id: $personId) {
      id
      firstName
      lastName
      cars {
        id
        year
        make
        model
        price
      }
    }
  }
`;
