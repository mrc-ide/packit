export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message); // Pass the message to the Error constructor
    this.name = "ApiError"; // Set the name of the error
    this.status = status; // Set the status
  }
}
