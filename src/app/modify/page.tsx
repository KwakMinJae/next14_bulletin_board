"use client";

import React, { Suspense } from "react";
import ClientModifyPage from "./ClientModifyPage";

const ModifyPage = () => {
    return (
        <>
            <Suspense>
                <ClientModifyPage />
            </Suspense>
        </>
    )
}

export default ModifyPage;