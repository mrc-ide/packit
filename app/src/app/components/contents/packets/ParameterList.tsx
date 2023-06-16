import React from "react";

interface ParameterProp {
    parameters: Record<string, string>
}

export default function ParameterList({parameters}: ParameterProp) {
    return (
        <>
            <span className="p-2 fw-semibold">Parameters </span>
            <div className="w-50">
                {Object.entries(parameters).map(([key, value], index) => (
                    <div key={index} className="float-start">
                        <span className="p-2">{key}:</span>
                        <span className="badge badge-parameter">{value}</span>
                    </div>
                ))}
            </div>
        </>
    );
}
