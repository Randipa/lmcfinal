const Attendance = () => {
  const sessions = [
    { date: '2025-06-01', status: '✅' },
    { date: '2025-06-03', status: '❌' },
    { date: '2025-06-05', status: '✅' }
  ];

  return (
    <div className="container py-4">
      <h4>Attendance</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Date</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, i) => (
            <tr key={i}><td>{s.date}</td><td>{s.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
