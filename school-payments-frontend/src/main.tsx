// // import React from 'react';
// // import ReactDOM from 'react-dom/client';
// // import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// // import { AuthProvider } from './auth/AuthContext';
// // import ProtectedRoute from './components/ProtectedRoute';
// // import Login from './pages/Login';
// // import Dashboard from './pages/Dashboard';
// // import CreatePayment from './pages/CreatePayment';
// // import Transactions from './pages/Transactions';
// // import StatusByCustomId from './pages/StatusByCustomId';
// // import './index.css';

// // ReactDOM.createRoot(document.getElementById('root')!).render(
// //   <React.StrictMode>
// //     <AuthProvider>
// //       <BrowserRouter>
// //         <Routes>
// //           <Route path="/" element={<Navigate to="/dashboard" replace />} />
// //           <Route path="/login" element={<Login />} />
// //           <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
// //           <Route path="/create-payment" element={<ProtectedRoute><CreatePayment /></ProtectedRoute>} />
// //           <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
// //           <Route path="/status" element={<ProtectedRoute><StatusByCustomId /></ProtectedRoute>} />
// //           <Route path="*" element={<div style={{ padding: 20 }}>Not found</div>} />
// //         </Routes>
// //       </BrowserRouter>
// //     </AuthProvider>
// //   </React.StrictMode>
// // );

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './auth/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import CreatePayment from './pages/CreatePayment';
// import Transactions from './pages/Transactions';
// import StatusByCustomId from './pages/StatusByCustomId';
// import PaymentSuccess from './pages/PaymentSuccess';
// import TransactionsBySchool from './pages/TransactionsBySchool';
// import './index.css';

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//           <Route path="/create-payment" element={<ProtectedRoute><CreatePayment /></ProtectedRoute>} />
//           <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
//           <Route path="/transactions-by-school" element={<ProtectedRoute><TransactionsBySchool /></ProtectedRoute>} />
//           <Route path="/status" element={<ProtectedRoute><StatusByCustomId /></ProtectedRoute>} />
//           <Route path="/payment-success" element={<PaymentSuccess />} />
//           <Route path="*" element={<div style={{ padding: 20 }}>Not found</div>} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreatePayment from './pages/CreatePayment';
import Transactions from './pages/Transactions';
import TransactionsBySchool from './pages/TransactionsBySchool';
import StatusByCustomId from './pages/StatusByCustomId';
import PaymentSuccess from './pages/PaymentSuccess';
import NotFound from './pages/NotFound';
import './index.css';
import Register from './pages/Register';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 2200 }} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-payment" element={<ProtectedRoute><CreatePayment /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/transactions-by-school" element={<ProtectedRoute><TransactionsBySchool /></ProtectedRoute>} />
          <Route path="/status" element={<ProtectedRoute><StatusByCustomId /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />

          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);