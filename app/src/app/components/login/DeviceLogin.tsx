import VerificationInput from "react-verification-input";
import {Button} from "../Base/Button";
import appConfig from "../../../config/appConfig";
import {HttpStatus} from "../../../lib/types/HttpStatus";
import {useState} from "react";
import {getAuthHeader} from "../../../lib/auth/getAuthHeader";
import {Check} from "lucide-react";

export const DeviceLogin = () => {

    const USER_CODE_LENGTH = 9;

    const [userCode, setUserCode] = useState('');
    const [resultStatus, setResultStatus] = useState<HttpStatus | null>(null);

    // TODO: enter key should press button if code is complete

    const handleChange = (newValue: string) => {
        setUserCode(newValue.toUpperCase());
    };

    const handleSubmit = async () => {
        const url = `${appConfig.apiUrl()}/deviceAuth/validate`;
        const res = await fetch(url, {
            method: "POST",
            body: userCode,
            headers: {
                "Content-Type": "text/plain",
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
                    <div>
                        <Check className="mx-auto h-20 w-20 text-muted-foreground" />
                        Success! You are now logged in and can access Packit API from your console.
                    </div>
                )}
                {resultStatus != HttpStatus.OK && (
                    <>
                    <p>Enter the code displayed in your console.</p>
                    <VerificationInput
                        value={userCode}
                        length={USER_CODE_LENGTH}
                        validChars={'A-Za-z-'}
                        placeholder={""}
                        autoFocus={true}
                        onChange={handleChange}
                        classNames={ {
                            container: "mx-auto",
                            characterSelected:""
                        } }
                    />
                    <Button onClick={handleSubmit} disabled={userCode.length !== USER_CODE_LENGTH}>
                        Continue
                    </Button>
                    </>
                )}

                {resultStatus == HttpStatus.BadRequest && (
                    <p className="text-destructive">Code has expired or is not recognised.</p>
                )}
            </div>
        </>
    );
};
