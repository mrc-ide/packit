import VerificationInput from "react-verification-input";
import {Button} from "../Base/Button";
import {fetcher} from "../../../lib/fetch";
import appConfig from "../../../config/appConfig";
import {ApiError} from "../../../lib/errors";
import {HttpStatus} from "../../../lib/types/HttpStatus";
import {useState} from "react";

export const DeviceLogin = () => {

    const USER_CODE_LENGTH = 9;

    let resultStatus = null;
    const [userCode, setUserCode] = useState('');

    // TODO: auto focus input
    // TODO: enter key should press button if code is complete


    const handleSubmit = async () => {
    try {
        const data: { token: string } = await fetcher({
            url: `${appConfig.apiUrl()}/deviceAuth/validate`,
            body: userCode,
            method: "POST",
            noAuth: false
        });
        // TODO: set result status for sucess and error
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            if (error.status === HttpStatus.Forbidden) {

            }
        }
    }

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
                        classNames={ {container: "mx-auto"} }
                    />
                    <Button type="submit" onSubmit={handleSubmit} disabled={userCode.length !== USER_CODE_LENGTH}>
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
