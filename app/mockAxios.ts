import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// This sets the mock adapter on the default instance
const mockAxios = new MockAdapter(axios);

export default mockAxios;
