import React from "react";

interface ParameterProps {
    parameters: Record<string, string> | null
}

export default function ParameterList({parameters}: ParameterProps) {
    return (
        <>
            <span className="p-2 fw-semibold">Parameters </span>
            <div className="w-50">
                {parameters && Object.entries(parameters).map(([key, value], index) => (
                    <div key={index} className="float-start">
                        <span className="p-2">{key}:</span>
                        <span className="badge badge-parameter">{value}</span>
                    </div>
                ))}
            </div>
        </>
    );
}
