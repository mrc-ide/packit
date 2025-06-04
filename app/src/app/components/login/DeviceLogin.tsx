import VerificationInput from "react-verification-input";
import {Button} from "../Base/Button";
import appConfig from "../../../config/appConfig";
import {ApiError} from "../../../lib/errors";
import {HttpStatus} from "../../../lib/types/HttpStatus";
import {useState} from "react";
import {getAuthHeader} from "../../../lib/auth/getAuthHeader";
import {PacketErrorBody} from "../../../types";

export const DeviceLogin = () => {

    const USER_CODE_LENGTH = 9;

    //let resultStatus = null;
    const [userCode, setUserCode] = useState('');
    const [resultStatus, setResultStatus] = useState<HttpStatus | null>(null);

    // TODO: auto focus input
    // TODO: enter key should press button if code is complete

    const handleChange = (newValue: string) => {
        setUserCode(newValue);
    };

    const handleSubmit = async () => {
        const url = `${appConfig.apiUrl()}/deviceAuth/validate`;
        const res = await fetch(url, {
            method: "POST",
            body: userCode,
            headers: {
                "Content-Type": "text.plain",
                ...getAuthHeader()
            }
        });
        setResultStatus(res.status as HttpStatus);
    };

    return (
        <>
            <div className="space-y-4 text-center mt-8">
                <h1 className="text-2xl font-semibold tracking-tight">Packit API Login</h1>
                {resultStatus == HttpStatus.OK && (
                    <div>Success! You are now logged in and can acccess Packit API from your console. </div>
                )}
                {resultStatus != HttpStatus.OK && (
                    <>
                    <p>Enter the code displayed in your console.</p>
                    <VerificationInput
                        value={userCode}
                        length={USER_CODE_LENGTH}
                        validChars={'A-Z-'}
                        placeholder={""}
                        autoFocus={true}
                        onChange={handleChange}
                        classNames={ {container: "mx-auto"} }
                    />
                    <Button onClick={handleSubmit} disabled={userCode.length !== USER_CODE_LENGTH}>
                        Continue
                    </Button>
                    </>
                )}

                {resultStatus == HttpStatus.BadRequest && (
                    <div>Code has expired or is not recognised.</div>
                )}

            </div>
        </>
    );
};
