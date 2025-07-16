import React, { useState, useEffect } from 'react';

const AuthDebug = () => {
  const [authInfo, setAuthInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp && payload.exp * 1000 < Date.now();
        
        setAuthInfo({
          hasToken: true,
          tokenValid: true,
          isExpired,
          payload,
          user: user ? JSON.parse(user) : null,
          tokenPreview: token.substring(0, 50) + '...'
        });
      } catch (err) {
        setAuthInfo({
          hasToken: true,
          tokenValid: false,
          error: err.message,
          tokenPreview: token.substring(0, 50) + '...'
        });
      }
    } else {
      setAuthInfo({
        hasToken: false
      });
    }
  }, []);

  if (!authInfo) return <div>Loading auth info...</div>;

  return (
    <div className="card mt-3">
      <div className="card-header">
        <h5>🔍 Authentication Debug Info</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h6>Token Status</h6>
            <ul className="list-group list-group-flush">
              <li className={`list-group-item d-flex justify-content-between ${authInfo.hasToken ? 'text-success' : 'text-danger'}`}>
                Has Token: {authInfo.hasToken ? '✅ Yes' : '❌ No'}
              </li>
              {authInfo.hasToken && (
                <>
                  <li className={`list-group-item d-flex justify-content-between ${authInfo.tokenValid ? 'text-success' : 'text-danger'}`}>
                    Token Valid: {authInfo.tokenValid ? '✅ Yes' : '❌ No'}
                  </li>
                  {authInfo.tokenValid && (
                    <li className={`list-group-item d-flex justify-content-between ${authInfo.isExpired ? 'text-danger' : 'text-success'}`}>
                      Expired: {authInfo.isExpired ? '❌ Yes' : '✅ No'}
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
          
          {authInfo.payload && (
            <div className="col-md-6">
              <h6>User Info</h6>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  User ID: {authInfo.payload.userId}
                </li>
                <li className="list-group-item">
                  Role: {authInfo.payload.userRole}
                </li>
                <li className="list-group-item">
                  Expires: {new Date(authInfo.payload.exp * 1000).toLocaleString()}
                </li>
              </ul>
            </div>
          )}
        </div>
        
        {authInfo.error && (
          <div className="alert alert-danger mt-3">
            <strong>Token Error:</strong> {authInfo.error}
          </div>
        )}
        
        <details className="mt-3">
          <summary>Raw Token Preview</summary>
          <pre className="bg-light p-2 mt-2" style={{fontSize: '0.8em', wordBreak: 'break-all'}}>
            {authInfo.tokenPreview}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default AuthDebug;