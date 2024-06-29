import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PERSON_WITH_CARS, UPDATE_PERSON, DELETE_PERSON, UPDATE_CAR, DELETE_CAR } from '../graphql/queries';
import { Button, Card, List, Form, Input, Modal } from 'antd';
import { gql } from '@apollo/client';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_PERSON_WITH_CARS, {
    variables: { personId: id }
  });
  const [updatePerson] = useMutation(UPDATE_PERSON);
  const [deletePerson] = useMutation(DELETE_PERSON);
  const [updateCar] = useMutation(UPDATE_CAR);
  const [deleteCar] = useMutation(DELETE_CAR);

  const [personForm] = Form.useForm();
  const [carForm] = Form.useForm();
  const [isPersonModalVisible, setIsPersonModalVisible] = useState(false);
  const [isCarModalVisible, setIsCarModalVisible] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  const person = data.person;

  const showEditPersonModal = () => {
    personForm.setFieldsValue({ firstName: person.firstName, lastName: person.lastName });
    setIsPersonModalVisible(true);
  };

  const handleEditPerson = async () => {
    try {
      const values = await personForm.validateFields();
      await updatePerson({
        variables: { id: person.id, firstName: values.firstName, lastName: values.lastName },
        optimisticResponse: {
          updatePerson: {
            id: person.id,
            firstName: values.firstName,
            lastName: values.lastName,
            __typename: 'Person',
          },
        },
        update: (cache, { data: { updatePerson } }) => {
          cache.modify({
            id: cache.identify(person),
            fields: {
              firstName() {
                return updatePerson.firstName;
              },
              lastName() {
                return updatePerson.lastName;
              },
            },
          });
        },
      });
      setIsPersonModalVisible(false);
    } catch (error) {
      console.error('Failed to update person:', error);
    }
  };

  const handleDeletePerson = async () => {
    try {
      await deletePerson({
        variables: { id: person.id },
        optimisticResponse: {
          deletePerson: {
            id: person.id,
            __typename: 'Person',
          },
        },
        update: (cache) => {
          cache.evict({ id: cache.identify(person) });
          cache.gc();
        },
      });
    } catch (error) {
      console.error('Failed to delete person:', error);
    } finally {
      navigate('/');
    }
  };
  
  const showEditCarModal = (car) => {
    carForm.setFieldsValue(car);
    setEditingCar(car);
    setIsCarModalVisible(true);
  };

  const handleEditCar = async () => {
    try {
      const values = await carForm.validateFields();
      await updateCar({
        variables: {
          id: editingCar.id,
          year: parseInt(values.year),
          make: values.make,
          model: values.model,
          price: parseFloat(values.price),
          personId: person.id
        },
        optimisticResponse: {
          updateCar: {
            id: editingCar.id,
            year: parseInt(values.year),
            make: values.make,
            model: values.model,
            price: parseFloat(values.price),
            personId: person.id,
            __typename: 'Car',
          },
        },
        update: (cache, { data: { updateCar } }) => {
          const personId = cache.identify(person);
          cache.modify({
            id: personId,
            fields: {
              cars(existingCars = []) {
                const updatedCarIndex = existingCars.findIndex(car => car.__ref === `Car:${updateCar.id}`);
                const updatedCars = [...existingCars];
                updatedCars[updatedCarIndex] = cache.writeFragment({
                  data: updateCar,
                  fragment: gql`
                    fragment UpdatedCar on Car {
                      id
                      year
                      make
                      model
                      price
                      personId
                    }
                  `,
                });
                return updatedCars;
              },
            },
          });
        },
      });
      setIsCarModalVisible(false);
    } catch (error) {
      console.error('Failed to update car:', error);
    }
  };

  const handleDeleteCar = async (carId) => {
    try {
      await deleteCar({
        variables: { id: carId },
        optimisticResponse: {
          deleteCar: {
            id: carId,
            __typename: 'Car',
          },
        },
        update: (cache) => {
          const personId = cache.identify(person);
          cache.modify({
            id: personId,
            fields: {
              cars(existingCars = [], { readField }) {
                return existingCars.filter(car => carId !== readField('id', car));
              },
            },
          });
        },
      });
    } catch (error) {
      console.error('Failed to delete car:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button onClick={() => navigate('/')}>Go Back Home</Button>
      <Card title={`${person.firstName} ${person.lastName}`} style={{ marginTop: '20px' }}>
        <Button onClick={showEditPersonModal}>Edit Person</Button>
        <Button onClick={handleDeletePerson} danger>Delete Person</Button>
        <List
          itemLayout="horizontal"
          dataSource={person.cars}
          renderItem={car => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => showEditCarModal(car)}>Edit</Button>,
                <Button type="link" onClick={() => handleDeleteCar(car.id)} danger>Delete</Button>
              ]}
            >
              <List.Item.Meta title={`${car.year} ${car.make} ${car.model} - $${car.price}`} />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Edit Person"
        visible={isPersonModalVisible}
        onOk={handleEditPerson}
        onCancel={() => setIsPersonModalVisible(false)}
      >
        <Form form={personForm} layout="vertical">
          <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'First Name is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Last Name is required' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Car"
        visible={isCarModalVisible}
        onOk={handleEditCar}
        onCancel={() => setIsCarModalVisible(false)}
      >
        <Form form={carForm} layout="vertical">
          <Form.Item name="year" label="Year" rules={[{ required: true, message: 'Year is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="make" label="Make" rules={[{ required: true, message: 'Make is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Model is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Price is required' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PersonDetail;

