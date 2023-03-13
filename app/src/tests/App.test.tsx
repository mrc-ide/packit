import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../app/App";

test("renders app welcome message", () => {
  render(<App />);
  const app = screen.getByTestId("main");
  expect(app).toHaveTextContent("Welcome to packit");
  expect(app.className).toBe("default");
});
