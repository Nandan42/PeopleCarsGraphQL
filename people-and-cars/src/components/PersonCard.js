import React from 'react';
import { Card, Button, List } from 'antd';
import { useNavigate } from 'react-router-dom';

const PersonCard = ({ person }) => {
  const navigate = useNavigate();

  const onLearnMore = () => {
    navigate(`/people/${person.id}`);
  };

  
  return (
    <Card title={`${person.firstName} ${person.lastName}`} extra={<Button onClick={onLearnMore}>Learn More</Button>}>
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
  );
};

export default PersonCard;
