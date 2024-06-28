import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PEOPLE_AND_CARS, ADD_PERSON, ADD_CAR } from '../graphql/queries';
import { Form, Input, Button, Select, Card, List } from 'antd';
import PersonCard from '../components/PersonCard';
import { gql } from '@apollo/client';

const { Option } = Select;

const Home = () => {
  const { loading, error, data, refetch } = useQuery(GET_PEOPLE_AND_CARS);
  const [addPerson] = useMutation(ADD_PERSON);
  const [addCar] = useMutation(ADD_CAR);

  const [personForm] = Form.useForm();
  const [carForm] = Form.useForm();

  useEffect(() => {
    refetch(); // Refetch data whenever there's a change (like adding a person or car)
  }, [addPerson, addCar, refetch]);

  const onAddPerson = async (values) => {
    try {
      await addPerson({
        variables: { firstName: values.firstName, lastName: values.lastName },
        update: (cache, { data: { addPerson } }) => {
          cache.modify({
            fields: {
              people(existingPeople = []) {
                const newPersonRef = cache.writeFragment({
                  data: addPerson,
                  fragment: gql`
                    fragment NewPerson on Person {
                      id
                      firstName
                      lastName
                    }
                  `
                });
                return [...existingPeople, newPersonRef];
              }
            }
          });
        }
      });
      personForm.resetFields();
    } catch (error) {
      console.error('Failed to add person:', error);
    }
  };

  const onAddCar = async (values) => {
    try {
      await addCar({
        variables: {
          year: parseInt(values.year),
          make: values.make,
          model: values.model,
          price: parseFloat(values.price),
          personId: values.personId
        },
        update: (cache, { data: { addCar } }) => {
          // Read the person's cached data
          const personId = cache.identify({ __typename: 'Person', id: values.personId });
          const personData = cache.readFragment({ id: personId, fragment: gql`
            fragment PersonWithCars on Person {
              id
              cars {
                id
                year
                make
                model
                price
              }
            }
          `});
  
          // Update the cache with the new car data
          const newCarRef = cache.writeFragment({
            data: addCar,
            fragment: gql`
              fragment NewCar on Car {
                id
                year
                make
                model
                price
                personId
              }
            `
          });
  
          // Append the new car to the existing cars list in the person's cached data
          cache.writeFragment({
            id: personId,
            fragment: gql`
              fragment UpdatePersonCars on Person {
                cars {
                  id
                  year
                  make
                  model
                  price
                }
              }
            `,
            data: {
              ...personData,
              cars: [...personData.cars, newCarRef]
            }
          });
        }
      });
  
      carForm.resetFields();
    } catch (error) {
      console.error('Failed to add car:', error);
    }
  };
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>People and Their Cars</h1>
      <Card title="Add Person">
        <Form form={personForm} onFinish={onAddPerson} layout="inline">
          <Form.Item name="firstName" rules={[{ required: true, message: 'First Name is required' }]}>
            <Input placeholder="First Name" />
          </Form.Item>
          <Form.Item name="lastName" rules={[{ required: true, message: 'Last Name is required' }]}>
            <Input placeholder="Last Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add Person</Button>
          </Form.Item>
        </Form>
      </Card>
      <Card title="Add Car" style={{ marginTop: '20px' }}>
        <Form form={carForm} onFinish={onAddCar} layout="inline">
          <Form.Item name="year" rules={[{ required: true, message: 'Year is required' }]}>
            <Input placeholder="Year" />
          </Form.Item>
          <Form.Item name="make" rules={[{ required: true, message: 'Make is required' }]}>
            <Input placeholder="Make" />
          </Form.Item>
          <Form.Item name="model" rules={[{ required: true, message: 'Model is required' }]}>
            <Input placeholder="Model" />
          </Form.Item>
          <Form.Item name="price" rules={[{ required: true, message: 'Price is required' }]}>
            <Input placeholder="Price" />
          </Form.Item>
          <Form.Item name="personId" rules={[{ required: true, message: 'Person is required' }]}>
            <Select placeholder="Select a person">
              {data.people.map(person => (
                <Option key={person.id} value={person.id}>{`${person.firstName} ${person.lastName}`}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add Car</Button>
          </Form.Item>
        </Form>
      </Card>
      <List
        style={{ marginTop: '20px' }}
        grid={{ gutter: 16, column: 1 }}
        dataSource={data.people}
        renderItem={person => (
          <List.Item>
            <PersonCard person={person} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Home;
