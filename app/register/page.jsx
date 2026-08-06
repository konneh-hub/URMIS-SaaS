'use client';

import React, { Suspense } from 'react';
import RegisterPage from '../../src/auth/pages/Register';

export default function RegisterRoute() {
  return (
    <Suspense fallback={null}>
      <RegisterPage />
    </Suspense>
  );
}
