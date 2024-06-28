import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PERSON_WITH_CARS } from '../graphql/queries';
import { Button, Card, List } from 'antd';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_PERSON_WITH_CARS, {
    variables: { personId: id }
  });


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  const person = data.person;

  
  return (
    <div style={{ padding: '20px' }}>
      <Button onClick={() => navigate('/')}>Go Back Home</Button>
      <Card title={`${person.firstName} ${person.lastName}`} style={{ marginTop: '20px' }}>
        <List
          itemLayout="horizontal"
          dataSource={person.cars}
          renderItem={car => (
            <List.Item>
              <List.Item.Meta title={`${car.year} ${car.make} ${car.model} - $${car.price}`} />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default PersonDetail;
