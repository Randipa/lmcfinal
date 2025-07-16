import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Class Navigation
import GradeList from './pages/Classes/GradeList';
import SubjectList from './pages/Classes/SubjectList';
import TeacherList from './pages/Classes/TeacherList';
import TeacherCourses from './pages/Classes/TeacherCourses';
import ClassDetail from './pages/Classes/ClassDetail';
import AllClasses from './pages/Classes/AllClasses';

// Shop
import Shop from './pages/Shop/Shop';
import Cart from './pages/Shop/Cart';
import Checkout from './pages/Shop/Checkout';

// Student Dashboard
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import MyClasses from './pages/Dashboard/MyClasses';
import LiveClasses from './pages/Dashboard/LiveClasses';
import Recordings from './pages/Dashboard/Recordings';
import Assignments from './pages/Dashboard/Assignments';
import MyRecordings from './pages/Dashboard/MyRecordings';
import MyAssignments from './pages/Dashboard/MyAssignments';
import Marks from './pages/Dashboard/Marks';
import Attendance from './pages/Dashboard/Attendance';
import PaymentHistory from './pages/Dashboard/PaymentHistory';
import PendingPayments from './pages/Dashboard/PendingPayments';
import Notices from './pages/Dashboard/Notices';
import ClassDashboard from './pages/Dashboard/ClassDashboard';
import ELibrary from './pages/ELibrary/ELibrary';
import PaymentSuccess from './pages/PaymentSuccess';

// Teacher Pages
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import AddAssignment from './pages/Teacher/AddAssignment';
import AddNotice from './pages/Teacher/AddNotice';
import CourseAssignments from './pages/Teacher/CourseAssignments';
import AssignmentSubmissions from './pages/Teacher/AssignmentSubmissions';
import AssistantAssignmentSubmissions from './pages/Assistant/AssignmentSubmissions';

// Assistant Pages
import AssistantDashboard from './pages/Assistant/AssistantDashboard';
import TeacherAssignments from './pages/Assistant/TeacherAssignments';
import AssistantTeacherCourses from './pages/Assistant/TeacherCourses';
import AssistantCourseAssignments from './pages/Assistant/CourseAssignments';

// Admin Pages
import CourseUploader from './pages/Admin/CourseUploader';
import CourseList from './pages/Admin/CourseList';
import CreateCourse from './pages/Admin/CreateCourse';
import PaymentList from './pages/Admin/PaymentList';
import BankPaymentRequests from './pages/Admin/BankPaymentRequests';
import LibraryList from './pages/Admin/LibraryList';
import UploadLibrary from './pages/Admin/UploadLibrary';
import InquiryList from './pages/Admin/InquiryList';
import InquiryDetail from './pages/Admin/InquiryDetail';
import TeacherListAdmin from './pages/Admin/TeacherList';
import CreateTeacher from './pages/Admin/CreateTeacher';
import EditTeacher from './pages/Admin/EditTeacher';
import AssistantList from './pages/Admin/AssistantList';
import CreateAssistant from './pages/Admin/CreateAssistant';
import NoticeList from './pages/Admin/NoticeList';
import CreateNotice from './pages/Admin/CreateNotice';
import CreateProduct from './pages/Admin/CreateProduct';
import ProductList from './pages/Admin/ProductList';
import EditProduct from './pages/Admin/EditProduct';
import OrderList from './pages/Admin/OrderList';
import RequireAdmin from './components/RequireAdmin';
import RequireTeacher from './components/RequireTeacher';
import RequireAssistant from './components/RequireAssistant';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Classes Flow */}
        <Route path="/classes" element={<GradeList />} />
        <Route path="/classes/all" element={<AllClasses />} />
        <Route path="/classes/:gradeId/subjects" element={<SubjectList />} />
        <Route path="/classes/:gradeId/subjects/:subjectName/teachers" element={<TeacherList />} />
        <Route path="/classes/:gradeId/subjects/:subjectName/teachers/:teacherId" element={<TeacherCourses />} />
        <Route path="/classes/:gradeId/teachers" element={<TeacherList />} />
        <Route path="/classes/:gradeId/teachers/:teacherId" element={<TeacherCourses />} />
        <Route path="/class/:classId" element={<ClassDetail />} />

        {/* Shop */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/cart" element={<Cart />} />
        <Route path="/shop/checkout" element={<Checkout />} />

        {/* Payment return */}
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/dashboard/classes" element={<MyClasses />} />
        <Route path="/dashboard/course/:classId" element={<ClassDashboard />} />
        <Route path="/dashboard/recordings" element={<MyRecordings />} />
        <Route path="/dashboard/assignments" element={<MyAssignments />} />
        <Route path="/dashboard/notices" element={<Notices />} />
        <Route path="/dashboard/live/:classId" element={<LiveClasses />} />
        <Route path="/dashboard/recordings/:classId" element={<Recordings />} />
        <Route path="/dashboard/assignments/:classId" element={<Assignments />} />
        <Route path="/dashboard/marks/:classId" element={<Marks />} />
        <Route path="/dashboard/attendance" element={<Attendance />} />
        <Route path="/dashboard/payments" element={<PaymentHistory />} />
        <Route path="/dashboard/pending-payments" element={<PendingPayments />} />

        {/* Library */}
        <Route path="/e-library" element={<ELibrary />} />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={<RequireTeacher><TeacherDashboard /></RequireTeacher>} />
        <Route path="/teacher/courses/:courseId/upload" element={<RequireTeacher><CourseUploader /></RequireTeacher>} />
        <Route path="/teacher/courses/:courseId/assignments" element={<RequireTeacher><CourseAssignments /></RequireTeacher>} />
        <Route path="/teacher/courses/:courseId/assignments/new" element={<RequireTeacher><AddAssignment /></RequireTeacher>} />
        <Route path="/teacher/assignments/:assignmentId/submissions" element={<RequireTeacher><AssignmentSubmissions /></RequireTeacher>} />
        <Route path="/teacher/notices/new" element={<RequireTeacher><AddNotice /></RequireTeacher>} />

        {/* Assistant */}
        <Route path="/assistant/dashboard" element={<RequireAssistant><AssistantDashboard /></RequireAssistant>} />
        <Route path="/assistant/teacher/:teacherId/courses" element={<RequireAssistant><AssistantTeacherCourses /></RequireAssistant>} />
        <Route path="/assistant/course/:courseId/assignments" element={<RequireAssistant><AssistantCourseAssignments /></RequireAssistant>} />
        <Route path="/assistant/teacher/:teacherId/assignments" element={<RequireAssistant><TeacherAssignments /></RequireAssistant>} />
        <Route path="/assistant/assignments/:assignmentId/submissions" element={<RequireAssistant><AssistantAssignmentSubmissions /></RequireAssistant>} />

        {/* Admin */}
        <Route path="/admin/courses" element={<RequireAdmin><CourseList /></RequireAdmin>} />
        <Route path="/admin/courses/create" element={<RequireAdmin><CreateCourse /></RequireAdmin>} />
        <Route path="/admin/courses/:courseId/upload" element={<RequireAdmin><CourseUploader /></RequireAdmin>} />
        <Route path="/admin/payments" element={<RequireAdmin><PaymentList /></RequireAdmin>} />
        <Route path="/admin/bank-payments" element={<RequireAdmin><BankPaymentRequests /></RequireAdmin>} />
        <Route path="/admin/inquiries" element={<RequireAdmin><InquiryList /></RequireAdmin>} />
        <Route path="/admin/inquiries/:inquiryId" element={<RequireAdmin><InquiryDetail /></RequireAdmin>} />
        <Route path="/admin/library" element={<RequireAdmin><LibraryList /></RequireAdmin>} />
        <Route path="/admin/library/upload" element={<RequireAdmin><UploadLibrary /></RequireAdmin>} />
        <Route path="/admin/teachers" element={<RequireAdmin><TeacherListAdmin /></RequireAdmin>} />
        <Route path="/admin/teachers/create" element={<RequireAdmin><CreateTeacher /></RequireAdmin>} />
        <Route path="/admin/teachers/:teacherId/edit" element={<RequireAdmin><EditTeacher /></RequireAdmin>} />
        <Route path="/admin/assistants" element={<RequireAdmin><AssistantList /></RequireAdmin>} />
        <Route path="/admin/assistants/create" element={<RequireAdmin><CreateAssistant /></RequireAdmin>} />
        <Route path="/admin/notices" element={<RequireAdmin><NoticeList /></RequireAdmin>} />
        <Route path="/admin/notices/create" element={<RequireAdmin><CreateNotice /></RequireAdmin>} />
        <Route path="/admin/products" element={<RequireAdmin><ProductList /></RequireAdmin>} />
        <Route path="/admin/products/create" element={<RequireAdmin><CreateProduct /></RequireAdmin>} />
        <Route path="/admin/products/:productId/edit" element={<RequireAdmin><EditProduct /></RequireAdmin>} />
        <Route path="/admin/orders" element={<RequireAdmin><OrderList /></RequireAdmin>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
