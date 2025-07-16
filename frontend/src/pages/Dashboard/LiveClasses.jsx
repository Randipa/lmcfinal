import { useParams } from 'react-router-dom';

const LiveClasses = () => {
  const { classId } = useParams();
  const zoomLinks = [
    { time: '2025-06-20 5PM', link: 'https://zoom.us/live/1' },
    { time: '2025-06-25 5PM', link: 'https://zoom.us/live/2' },
  ];

  return (
    <div className="container py-4">
      <h4>Upcoming Live Classes – {classId}</h4>
      <ul className="list-group">
        {zoomLinks.map((z, i) => (
          <li key={i} className="list-group-item d-flex justify-content-between">
            {z.time}
            <a href={z.link} target="_blank" className="btn btn-sm btn-primary">Join</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveClasses;
