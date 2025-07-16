import Tile from '../components/Tile';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="container py-5">
      <div className="hero">
        <h2 className="mb-2">Welcome to the Learning Platform</h2>
        {user && (
          <p className="mb-0">Hello, {user.firstName} {user.lastName}</p>
        )}
      </div>
      <div className="text-center mb-4">
        <h4 className="fw-semibold">Quick Access</h4>
      </div>

      <div className="row gy-4">
        {user?.userRole === 'teacher' ? (
          <Tile title="Teacher Dashboard" icon="🧑‍🏫" link="/teacher/dashboard" />
        ) : user?.userRole === 'assistant' ? (
          <Tile title="Assistant Dashboard" icon="🧑‍💼" link="/assistant/dashboard" />
        ) : (
          <>
            <Tile title="Classes" icon="🎓" link="/classes" />
            <Tile title="Shop" icon="🛒" link="/shop" />
            <Tile title="Student Dashboard" icon="📊" link="/dashboard" />
            <Tile title="Notices" icon="📢" link="/dashboard/notices" />
            <Tile title="E-Library" icon="📚" link="/e-library" />
          </>
        )}
        {user?.userRole === 'admin' && (
          <>
            <Tile title="Admin" icon="⚙️" link="/admin/courses" />
            <Tile title="Payments" icon="💳" link="/admin/payments" />
            <Tile title="Inquiries" icon="❓" link="/admin/inquiries" />
            <Tile title="Bank Deposits" icon="🏦" link="/admin/bank-payments" />
            <Tile title="E-Library" icon="📚" link="/admin/library" />
            <Tile title="Assistants" icon="🧑‍💼" link="/admin/assistants" />
            <Tile title="Teachers" icon="🧑‍🏫" link="/admin/teachers" />
            <Tile title="Notices" icon="📢" link="/admin/notices" />
            <Tile title="Products" icon="🛍️" link="/admin/products" />
            <Tile title="Orders" icon="📦" link="/admin/orders" />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
