import { Link } from 'react-router-dom';

const Tile = ({ title, icon, link }) => {
  return (
    <div className="col-6 col-md-3 text-center">
      <Link to={link} className="text-decoration-none tile-link">
        <div className="tile border-0 rounded p-4 h-100 d-flex flex-column justify-content-center align-items-center">
          <div className="tile-icon">{icon}</div>
          <h5 className="mt-2">{title}</h5>
        </div>
      </Link>
    </div>
  );
};

export default Tile;
