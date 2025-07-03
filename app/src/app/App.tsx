import { Header } from "@components/header";
import { Main } from "@components/main";

export const App = () => {
  return (
    <div data-testid="app">
      <Header />
      <div className="app">
        <Main />
      </div>
    </div>
  );
};
