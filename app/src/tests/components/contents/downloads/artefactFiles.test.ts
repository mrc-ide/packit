import {
  filesForArtefact,
  allArtefactsFilesForPacket
} from "../../../../../../app/src/app/components/contents/downloads/utils/artefactFiles";
import { PacketMetadata } from "../../../../types";

const artefact = {
  description: "An artefact containing some files",
  paths: ["directory//file.png", "file.csv", "file.xlsx", "file.pdf", "file.txt"]
};
const packet = {
  files: [
    { path: "directory/file.png", size: 30, hash: "hash1" },
    { path: "file.csv", size: 30, hash: "hash2" },
    { path: "file.xlsx", size: 30, hash: "hash3" },
    { path: "file.pdf", size: 30, hash: "hash4" },
    { path: "file.txt", size: 30, hash: "hash5" },
    { path: "my.file", size: 30, hash: "hash6" }
  ],
  custom: {
    orderly: {
      artefacts: [
        artefact,
        {
          description: "An artefact containing other files",
          paths: ["my.file"]
        }
      ]
    }
  }
} as PacketMetadata;

describe("filesForArtefact", () => {
  it("returns the correct files for a given artefact", () => {
    const result = filesForArtefact(artefact, packet);

    expect(result).toHaveLength(5);
    expect(result[0].path).toBe("directory/file.png");
    expect(result[1].path).toBe("file.csv");
    expect(result[2].path).toBe("file.xlsx");
    expect(result[3].path).toBe("file.pdf");
    expect(result[4].path).toBe("file.txt");
  });
});

describe("allArtefactsFilesForPacket", () => {
  it("returns all files for all artefacts in a given packet", () => {
    const result = allArtefactsFilesForPacket(packet);

    expect(result).toHaveLength(6);
    expect(result![0].path).toBe("directory/file.png");
    expect(result![1].path).toBe("file.csv");
    expect(result![2].path).toBe("file.xlsx");
    expect(result![3].path).toBe("file.pdf");
    expect(result![4].path).toBe("file.txt");
    expect(result![5].path).toBe("my.file");
  });
});
