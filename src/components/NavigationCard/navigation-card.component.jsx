import { Card, Button } from "react-bootstrap";

const NavigationCard = ({path, type}) => {    
  
  return (
    <>
      <Card className="m-4 mb-2 mt-2">
        <Card.Body>
          <Card.Title>Navigate to</Card.Title>
          <div className="space-x-2">
            <Button variant="outline-primary" href={path}>{type}</Button>
          </div>
        </Card.Body>
      </Card>
    </>
  )
}

export default NavigationCard;