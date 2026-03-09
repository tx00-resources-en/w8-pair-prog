import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div>
      <h2>Sorry</h2>
      <p>That page cannot be found.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default NotFoundPage;
