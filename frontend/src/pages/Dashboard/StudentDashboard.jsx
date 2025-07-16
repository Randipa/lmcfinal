import Tile from '../../components/Tile';
import './dashboard.css';

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="container py-5">
      <div className="hero dashboard-hero">
        <h2 className="mb-3">Student Dashboard</h2>
        {user && (
          <p className="mb-0">Welcome back, {user.firstName} {user.lastName}</p>
        )}
      </div>

      <div className="text-center mb-4">
        <h4 className="fw-semibold">Quick Links</h4>
      </div>

      <div className="row gy-4 dashboard-tiles">
        <Tile title="My Classes" icon="📚" link="/dashboard/classes" />
        <Tile title="Pending Payments" icon="💲" link="/dashboard/pending-payments" />
        <Tile title="Payment History" icon="💳" link="/dashboard/payments" />
        <Tile title="Recordings" icon="🎥" link="/dashboard/recordings" />
        <Tile title="Assignments" icon="📝" link="/dashboard/assignments" />
        <Tile title="Attendance" icon="✅" link="/dashboard/attendance" />
        <Tile title="Notices" icon="📢" link="/dashboard/notices" />
      </div>
    </div>
  );
};

export default StudentDashboard;
