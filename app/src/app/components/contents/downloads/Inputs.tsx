import { Card, CardContent } from "../../Base/Card";
import FileRow from "./FileRow";
import { PacketMetadata, Role } from "../../../../types";

interface InputsProps {
  inputs: Role[];
  packet: PacketMetadata;
}

export default function Inputs({ inputs, packet }: InputsProps) {

  return (
    <Card>
      <CardContent className="p-0">
        <ul>
          {inputs.map((input, index) => (<li key={index}>
            <FileRow path={input.path} packet={packet} />
          </li>))}
        </ul>
      </CardContent>
    </Card>
  );
};
