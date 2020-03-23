import buildHasuraProvider from "ra-data-hasura-graphql";
import React from "react";
import { Admin, Resource } from "react-admin";
// import buildHasuraProvider from "./dataProvider";
import req_hulft from "./req_hulft";

class App extends React.Component {
  constructor() {
    super();
    this.state = { dataProvider: null };
  }

  componentDidMount() {
    buildHasuraProvider({
      clientOptions: {
        uri: "http://localhost:5434/v1/graphql"
      }
    }).then((dataProvider) => {
      this.setState({ dataProvider });
    });
  }

  render() {
    const { dataProvider } = this.state;

    if (!dataProvider) {
      return <div>Loading..</div>;
    }
    return (
      <Admin dataProvider={dataProvider}>
        <Resource name="req_hulft" {...req_hulft} />
        <Resource name="cmdb_host_with_id" />
      </Admin>
    );
  }
}

export default App;
