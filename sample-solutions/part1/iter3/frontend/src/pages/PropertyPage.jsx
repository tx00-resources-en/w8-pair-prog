import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const PropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${id}`);
        if (!response.ok) {
          throw new Error("Property not found");
        }
        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error("Error fetching property:", error);
      }
    };
    fetchProperty();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rental-preview">
      <h2>{property.title}</h2>
      <p>Type: {property.type}</p>
      <p>Description: {property.description}</p>
      <p>Price: ${property.price}</p>
      <p>Address: {property.location?.address}</p>
      <p>City: {property.location?.city}</p>
      <p>State: {property.location?.state}</p>
      <p>Square Feet: {property.squareFeet}</p>
      <p>Year Built: {property.yearBuilt}</p>
      <p>Bedrooms: {property.bedrooms}</p>
      <Link to={`/edit-property/${property._id}`}>Edit</Link>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default PropertyPage;
