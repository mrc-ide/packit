import { HttpStatus } from "./types/HttpStatus";

export class ApiError extends Error {
  status: HttpStatus;

  constructor(message: string, status: HttpStatus) {
    super(message); // Pass the message to the Error constructor
    this.name = "ApiError"; // Set the name of the error
    this.status = status; // Set the status
  }
}
