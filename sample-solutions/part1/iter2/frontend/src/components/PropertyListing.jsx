import { Link } from "react-router-dom";

const PropertyListing = ({ property }) => {
  return (
    <Link to={`/properties/${property._id}`} className="rental-preview">
      <h2>{property.title}</h2>
      <p>Type: {property.type}</p>
      <p>Price: ${property.price}</p>
      <p>Location: {property.location?.city}, {property.location?.state}</p>
      <p>Bedrooms: {property.bedrooms}</p>
    </Link>
  );
};

export default PropertyListing;
