// app/view/page.tsx
"use client";

import React, { Suspense } from 'react';
import ClientViewPage from './ClientViewPage';
import LoadingSpinner from '../component/LoadingSpinner';

const ViewPage = () => {
  return (
    // <ClientViewPage board={board} />
    <Suspense fallback={<div><LoadingSpinner/></div>}>
      <ClientViewPage/>
    </Suspense>
  );
};

export default ViewPage;